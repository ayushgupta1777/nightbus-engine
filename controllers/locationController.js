const Location = require('../models/Location');
const Route = require('../models/Route');
const GoogleCache = require('../models/GoogleCache');

// Helper: Calculate distance between two coordinates in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Search locations with hybrid DB + Photon search and nearest stop mapping
exports.searchLocations = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.trim().length < 1) {
      return res.json({ success: true, locations: [] });
    }

    const searchQuery = query.toLowerCase().trim();

    // 1. Get all "Official Bus Stops" for nearest stop mapping
    const busStops = await Location.find({
      isActive: true,
      type: { $in: ['stop', 'boarding_stop', 'drop_stop'] }
    }).select('name coordinates type').lean();

    // 2. Local DB Search (Prefix, Contains, Text) - search all active locations
    const baseFilter = { isActive: true };

    let localResults = await Location.find({
      ...baseFilter,
      $or: [
        { name: new RegExp(`^${searchQuery}`, 'i') },
        { aliases: new RegExp(`^${searchQuery}`, 'i') }
      ]
    })
      .select('name state type coordinates popularity')
      .sort({ popularity: -1, name: 1 })
      .limit(limit)
      .lean();

    if (localResults.length < limit) {
      const moreLocal = await Location.find({
        ...baseFilter,
        _id: { $nin: localResults.map(l => l._id) },
        $or: [
          { name: new RegExp(searchQuery, 'i') },
          { aliases: new RegExp(searchQuery, 'i') }
        ]
      })
        .select('name state type coordinates popularity')
        .sort({ popularity: -1, name: 1 })
        .limit(limit - localResults.length)
        .lean();
      localResults = [...localResults, ...moreLocal];
    }

    if (localResults.length < limit) {
      const textSearchLocal = await Location.find({
        ...baseFilter,
        _id: { $nin: localResults.map(l => l._id) },
        $text: { $search: searchQuery }
      })
        .select('name state type coordinates popularity')
        .limit(limit - localResults.length)
        .lean();
      localResults = [...localResults, ...textSearchLocal];
    }

    // 2.5 Live Route Stops Search (extract matching stops from active routes so customers always see bus route stops)
    let routeStopResults = [];
    try {
      const matchingRoutes = await Route.find({
        isActive: true,
        $or: [
          { 'stops.name': new RegExp(searchQuery, 'i') },
          { 'stops.village': new RegExp(searchQuery, 'i') },
          { 'stops.district': new RegExp(searchQuery, 'i') },
          { 'stops.state': new RegExp(searchQuery, 'i') }
        ]
      }).select('routeName stops').lean();

      const seenStopNames = new Set();
      matchingRoutes.forEach(route => {
        (route.stops || []).forEach(stop => {
          const stopName = stop.name || stop.village;
          if (stopName && new RegExp(searchQuery, 'i').test(stopName)) {
            const lowerName = stopName.toLowerCase().trim();
            if (!seenStopNames.has(lowerName)) {
              seenStopNames.add(lowerName);
              routeStopResults.push({
                _id: stop._id || `routestop-${lowerName}`,
                name: stopName,
                state: stop.state || stop.district || 'India',
                city: stop.village || stop.district || stopName,
                type: 'stop',
                isBusStop: true,
                coordinates: stop.coordinates || null,
                popularity: 1000
              });
            }
          }
        });
      });
    } catch (routeErr) {
      console.warn('⚠️ Route stops search warning:', routeErr.message);
    }

    // 3. Google Places API External Search (Cached in MongoDB)
    let externalResults = [];
    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (apiKey) {
        const cacheKey = `places:${searchQuery}`;
        let cached = await GoogleCache.findOne({ cacheKey });
        let predictions = [];
        if (cached && cached.data) {
          predictions = cached.data;
        } else {
          const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&components=country:in&key=${apiKey}`;
          const response = await fetch(googleUrl);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'OK' && data.predictions) {
              predictions = data.predictions;
              await GoogleCache.findOneAndUpdate(
                { cacheKey },
                { $set: { cacheKey, type: 'places', data: predictions, createdAt: new Date() } },
                { upsert: true }
              );
            }
          }
        }

        externalResults = predictions.map(p => {
          const mainText = p.structured_formatting?.main_text || p.description;
          const secondaryText = p.structured_formatting?.secondary_text || '';
          const parts = secondaryText.split(',').map(s => s.trim()).filter(Boolean);
          const state = parts.length > 0 ? parts[parts.length - 1] : '';
          const city = parts.length > 1 ? parts[0] : mainText;
          return {
            name: mainText,
            state: state || city,
            type: 'external',
            placeId: p.place_id,
            displayName: p.description,
            city: city,
            external: true,
            coordinates: null
          };
        }).filter(r => r.name);
      }
    } catch (err) {
      console.warn('⚠️ Google Places API failed:', err.message);
    }

    // 4. Merge results (prioritizing route stops and local results) and map to nearest stop
    const allCandidates = [...routeStopResults, ...localResults, ...externalResults];
    const resultsMap = new Map();

    allCandidates.forEach(cand => {
      const key = `${cand.name.toLowerCase()}-${cand.state?.toLowerCase() || ''}`;
      if (!resultsMap.has(key) || cand.type !== 'external') {
        // Find nearest bus stop
        let nearestStop = null;
        let minDistance = Infinity;
        const isBusStop = ['stop', 'boarding_stop', 'drop_stop'].includes(cand.type);

        if (!isBusStop && busStops.length > 0 && cand.coordinates) {
          busStops.forEach(stop => {
            const dist = calculateDistance(
              cand.coordinates.latitude, cand.coordinates.longitude,
              stop.coordinates.latitude, stop.coordinates.longitude
            );
            if (dist < minDistance) {
              minDistance = dist;
              nearestStop = {
                name: stop.name,
                distance: Math.round(dist * 10) / 10,
                id: stop._id
              };
            }
          });
        }

        resultsMap.set(key, {
          id: cand._id || cand.placeId || `ext-${key}`,
          name: cand.name,
          state: cand.state,
          type: cand.type,
          coordinates: cand.coordinates,
          isBusStop,
          nearestStop: minDistance < 50 ? nearestStop : null,
          placeId: cand.placeId || null,
          city: cand.city || '',
          displayName: cand.displayName || cand.name
        });
      }
    });

    res.json({
      success: true,
      locations: Array.from(resultsMap.values()).slice(0, limit)
    });

  } catch (error) {
    console.error('❌ Location search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get popular locations
exports.getPopularLocations = async (req, res) => {
  try {
    const locations = await Location.find({ isActive: true })
      .select('name state type popularity')
      .sort({ popularity: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      locations: locations.map(loc => ({
        id: loc._id,
        name: loc.name,
        state: loc.state,
        type: loc.type,
        coordinates: loc.coordinates
      }))
    });

  } catch (error) {
    console.error('❌ Popular locations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Parse speech input (for voice search)
exports.parseSpeech = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const cleanText = text.toLowerCase().trim();

    // Extract location using NLP patterns
    const location = await extractLocationFromText(cleanText);

    res.json({
      success: true,
      location: location,
      originalText: text
    });

  } catch (error) {
    console.error('❌ Speech parsing error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to extract location from natural language
async function extractLocationFromText(text) {
  // Common Hindi/English patterns
  const patterns = [
    // Hindi: "jabalpur se indore jana hai"
    /(\w+)\s+(?:se|से)\s+(\w+)/i,
    // English: "from delhi to mumbai"
    /from\s+(\w+)\s+to\s+(\w+)/i,
    // Simple: "going to pune"
    /(?:going\s+to|jana\s+hai|जाना\s+है)\s+(\w+)/i,
    // Just city names
    /(\w+)\s+(?:city|नगर|शहर)/i
  ];

  // Try to extract using patterns
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const cityName = match[1] || match[2];

      // Search in database
      const location = await Location.findOne({
        isActive: true,
        $or: [
          { name: new RegExp(`^${cityName}`, 'i') },
          { aliases: new RegExp(cityName, 'i') }
        ]
      }).select('name').lean();

      if (location) {
        return location.name;
      }
    }
  }

  // If no pattern matched, try direct word matching
  const words = text.split(/\s+/);
  for (const word of words) {
    if (word.length >= 3) {
      const location = await Location.findOne({
        isActive: true,
        $or: [
          { name: new RegExp(`^${word}`, 'i') },
          { aliases: new RegExp(word, 'i') }
        ]
      }).select('name').lean();

      if (location) {
        return location.name;
      }
    }
  }

  return null;
}

// Create a new location (Landmark)
exports.createLocation = async (req, res) => {
  try {
    const { name, coordinates, type = 'stop', state = '', district = '' } = req.body;

    if (!name || !coordinates?.latitude || !coordinates?.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Name and valid coordinates are required'
      });
    }

    // Check if a location with the same name already exists for this user
    const existing = await Location.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      $or: [
        { createdBy: req.user._id },
        { isGlobal: true }
      ]
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Using existing landmark',
        location: {
          id: existing._id,
          name: existing.name,
          coordinates: existing.coordinates,
          type: existing.type
        }
      });
    }

    const newLocation = new Location({
      name: name.trim(),
      coordinates,
      type,
      state,
      district,
      createdBy: req.user._id,
      isGlobal: true // Make visible to everyone so other users can see it
    });

    await newLocation.save();

    res.status(201).json({
      success: true,
      message: 'Landmark created successfully',
      location: {
        id: newLocation._id,
        name: newLocation.name,
        coordinates: newLocation.coordinates,
        type: newLocation.type
      }
    });

  } catch (error) {
    console.error('❌ Create location error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Google Places Autocomplete search (cached in MongoDB)
exports.googlePlacesSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json({ success: true, predictions: [] });
    }
    const cacheKey = `places:${query.toLowerCase().trim()}`;
    let cached = await GoogleCache.findOne({ cacheKey });
    if (cached && cached.data) {
      return res.json({ success: true, predictions: cached.data, cached: true });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.predictions) {
      await GoogleCache.findOneAndUpdate(
        { cacheKey },
        { $set: { cacheKey, type: 'places', data: data.predictions, createdAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true, predictions: data.predictions, cached: false });
    }
    res.json({ success: true, predictions: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Google Place Details (cached in MongoDB)
exports.googlePlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.query;
    if (!placeId) {
      return res.status(400).json({ success: false, message: 'placeId is required' });
    }
    const cacheKey = `details:${placeId}`;
    let cached = await GoogleCache.findOne({ cacheKey });
    if (cached && cached.data) {
      return res.json({ success: true, result: cached.data, cached: true });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address,address_components&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.result) {
      await GoogleCache.findOneAndUpdate(
        { cacheKey },
        { $set: { cacheKey, type: 'details', data: data.result, createdAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true, result: data.result, cached: false });
    }
    res.json({ success: false, message: data.error_message || data.status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Google Reverse Geocoding (cached in MongoDB)
exports.googleReverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'lat and lon are required' });
    }
    const cacheKey = `geocode:${lat},${lon}`;
    let cached = await GoogleCache.findOne({ cacheKey });
    if (cached && cached.data) {
      return res.json({ success: true, address: cached.data.address, cached: true });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const address = data.results[0].formatted_address;
      await GoogleCache.findOneAndUpdate(
        { cacheKey },
        { $set: { cacheKey, type: 'geocode', data: { address }, createdAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true, address, cached: false });
    }
    res.json({ success: false, address: 'Unknown Location' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Official Google Routes API v2 (cached in MongoDB, road distance & travel time)
exports.googleRoute = async (req, res) => {
  try {
    const { origin, destination, waypoints = [], alternatives = true } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ success: false, message: 'origin and destination required' });
    }
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;
    const waypointsKey = waypoints.map(w => `${w.latitude},${w.longitude}`).join('|');
    const cacheKey = `routes-v2:${originStr}->${destStr}[${waypointsKey}]`;

    let cached = await GoogleCache.findOne({ cacheKey });
    if (cached && cached.data) {
      return res.json({ success: true, routes: cached.data, cached: true });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: Number(origin.latitude),
            longitude: Number(origin.longitude)
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: Number(destination.latitude),
            longitude: Number(destination.longitude)
          }
        }
      },
      intermediates: (waypoints || []).map(w => ({
        location: {
          latLng: {
            latitude: Number(w.latitude),
            longitude: Number(w.longitude)
          }
        }
      })),
      travelMode: 'DRIVE',
      computeAlternativeRoutes: Boolean(alternatives)
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.description,routes.legs.distanceMeters,routes.legs.duration,routes.legs.startLocation,routes.legs.endLocation,routes.legs.polyline.encodedPolyline'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data && data.routes && data.routes.length > 0) {
      const formattedRoutes = data.routes.map((route, idx) => {
        const polylinePoints = route.polyline?.encodedPolyline || '';
        const legs = (route.legs || []).map(leg => {
          const distVal = leg.distanceMeters || 0;
          const durSec = parseInt(String(leg.duration || '0').replace('s', ''), 10) || 0;
          return {
            distance: { value: distVal },
            duration: { value: durSec },
            start_address: '',
            end_address: '',
            polyline: { points: leg.polyline?.encodedPolyline || '' }
          };
        });

        let totalDist = 0;
        let totalDur = 0;
        legs.forEach(l => {
          totalDist += l.distance.value;
          totalDur += l.duration.value;
        });

        return {
          id: idx,
          summary: route.description || `Route ${idx + 1}`,
          overview_polyline: {
            points: polylinePoints
          },
          legs: legs.length > 0 ? legs : [{
            distance: { value: route.distanceMeters || totalDist },
            duration: { value: parseInt(String(route.duration || '0').replace('s', ''), 10) || totalDur },
            polyline: { points: polylinePoints }
          }],
          distanceMeters: route.distanceMeters || totalDist,
          durationSeconds: parseInt(String(route.duration || '0').replace('s', ''), 10) || totalDur
        };
      });

      await GoogleCache.findOneAndUpdate(
        { cacheKey },
        { $set: { cacheKey, type: 'routes-v2', data: formattedRoutes, createdAt: new Date() } },
        { upsert: true }
      );

      return res.json({ success: true, routes: formattedRoutes, cached: false });
    }

    res.json({ success: false, message: data.error?.message || 'No route found', routes: [] });
  } catch (error) {
    console.error('googleRoute (Routes API v2) error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Google Maps Roads API (cached in MongoDB, snapToRoads)
exports.googleRoads = async (req, res) => {
  try {
    const { tracePoints = [] } = req.body;
    if (!tracePoints || tracePoints.length < 2) {
      return res.status(400).json({ success: false, message: 'tracePoints array with at least 2 points required' });
    }

    const pathStr = tracePoints.map(p => `${p.latitude},${p.longitude}`).join('|');
    const cacheKey = `roads:${pathStr}`;

    let cached = await GoogleCache.findOne({ cacheKey });
    if (cached && cached.data) {
      return res.json({ success: true, snappedPoints: cached.data, cached: true });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://roads.googleapis.com/v1/snapToRoads?path=${encodeURIComponent(pathStr)}&interpolate=true&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data && data.snappedPoints && data.snappedPoints.length > 0) {
      await GoogleCache.findOneAndUpdate(
        { cacheKey },
        { $set: { cacheKey, type: 'roads', data: data.snappedPoints, createdAt: new Date() } },
        { upsert: true }
      );
      return res.json({ success: true, snappedPoints: data.snappedPoints, cached: false });
    }

    res.json({ success: false, message: data.error?.message || 'No snapped points found', snappedPoints: [] });
  } catch (error) {
    console.error('googleRoads error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save selected location attributes to MongoDB Location table (Req 7)
exports.saveSelectedLocation = async (req, res) => {
  try {
    const { placeId, latitude, longitude, displayName, name, city, state, type = 'stop' } = req.body;
    if (!name && !displayName) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const locationName = (displayName || name).trim();
    const existing = await Location.findOne({
      $or: [
        ...(placeId ? [{ placeId }] : []),
        { name: { $regex: new RegExp(`^${locationName}$`, 'i') } }
      ]
    });

    if (existing) {
      existing.placeId = placeId || existing.placeId;
      existing.displayName = displayName || existing.displayName || existing.name;
      existing.city = city || existing.city;
      existing.state = state || existing.state;
      if (latitude && longitude) {
        existing.coordinates = { latitude, longitude };
      }
      await existing.save();
      return res.json({ success: true, location: existing, updated: true });
    }

    const newLoc = new Location({
      name: locationName,
      displayName: displayName || locationName,
      placeId: placeId || undefined,
      city: city || '',
      state: state || '',
      type,
      coordinates: (latitude && longitude) ? { latitude, longitude } : undefined,
      isActive: true,
      isGlobal: true,
      createdBy: req.user ? req.user._id : undefined
    });
    await newLoc.save();
    return res.json({ success: true, location: newLoc, updated: false });
  } catch (error) {
    console.error('saveSelectedLocation error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  searchLocations: exports.searchLocations,
  getPopularLocations: exports.getPopularLocations,
  parseSpeech: exports.parseSpeech,
  createLocation: exports.createLocation,
  googlePlacesSearch: exports.googlePlacesSearch,
  googlePlaceDetails: exports.googlePlaceDetails,
  googleReverseGeocode: exports.googleReverseGeocode,
  googleRoute: exports.googleRoute,
  googleRoads: exports.googleRoads,
  saveSelectedLocation: exports.saveSelectedLocation
};