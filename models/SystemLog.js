const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['info', 'warning', 'error', 'debug', 'critical'],
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'backend' // 'backend', 'mobile_app', 'database'
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {} // Can contain stack traces, request bodies, IPs, user info
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: '7d' // Automatically delete logs after 7 days to save space
    }
});

// Index for quick querying by level or source
systemLogSchema.index({ level: 1, timestamp: -1 });
systemLogSchema.index({ source: 1, timestamp: -1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
