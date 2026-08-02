const mongoose = require('mongoose');

const googleCacheSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['places', 'details', 'geocode', 'routes', 'routes-v2', 'roads'],
    required: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 days TTL in seconds
  }
});

module.exports = mongoose.model('GoogleCache', googleCacheSchema);
