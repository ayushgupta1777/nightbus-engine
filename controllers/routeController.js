// ==================== controllers/routeController.js ====================
const Route = require('../models/Route');

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find().populate('ownerId');
    res.status(200).json({ success: true, routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get route by ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id).populate('ownerId');
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.status(200).json({ success: true, route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get schedule
exports.getSchedule = async (req, res) => {
  try {
    const route = await Route.findById(req.params.routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.status(200).json({ success: true, schedule: route.schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create route
exports.createRoute = async (req, res) => {
  try {
    const { fromStop, toStop, distance, estimatedDuration, basePrice, stops, schedule, ownerId } = req.body;
    
    const route = new Route({
      fromStop,
      toStop,
      distance,
      estimatedDuration,
      basePrice,
      stops,
      schedule,
      ownerId: ownerId || req.userId
    });
    
    await route.save();
    res.status(201).json({ success: true, message: 'Route created', route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update route
exports.updateRoute = async (req, res) => {
  try {
    const targetId = req.params.id || req.params.routeId;
    const updates = { ...req.body };

    if (typeof updates.isActive === 'boolean') {
      updates.status = updates.isActive ? 'active' : 'inactive';
    }

    const existingRoute = await Route.findById(targetId);
    if (!existingRoute) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    if (updates.departureTime && existingRoute.stops && existingRoute.stops.length > 0) {
      const updatedStops = existingRoute.stops.map((s, idx) => {
        const stopObj = s.toObject ? s.toObject() : { ...s };
        if (idx === 0) {
          stopObj.departureTime = updates.departureTime;
        }
        return stopObj;
      });
      updates.stops = updatedStops;
    }

    const route = await Route.findByIdAndUpdate(targetId, updates, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      data: { route },
      route
    });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update route status
exports.updateRouteStatus = async (req, res) => {
  try {
    const targetId = req.params.id || req.params.routeId;
    const { isActive, status } = req.body;

    const newIsActive = typeof isActive === 'boolean' ? isActive : (status === 'active');
    const newStatus = status || (newIsActive ? 'active' : 'inactive');

    const route = await Route.findByIdAndUpdate(
      targetId,
      { isActive: newIsActive, status: newStatus },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.status(200).json({
      success: true,
      message: `Route status updated to ${newStatus}`,
      data: { route },
      route
    });
  } catch (error) {
    console.error('Update route status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete route
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    res.status(200).json({ success: true, message: 'Route deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add stop to route
exports.addStop = async (req, res) => {
  try {
    const { stopName, stopLocation, arrivalTime, departureTime } = req.body;
    
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          stops: { stopName, stopLocation, arrivalTime, departureTime }
        }
      },
      { new: true }
    );
    
    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }
    
    res.status(200).json({ success: true, message: 'Stop added', route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
