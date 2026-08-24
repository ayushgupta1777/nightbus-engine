const mongoose = require('mongoose');

const appAnalyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Allow anonymous/unauthenticated tracking
    },
    role: {
        type: String,
        default: 'anonymous' // customer, owner, vendor, admin
    },
    screenName: {
        type: String,
        required: true
    },
    action: {
        type: String,
        default: 'view' // view, click, submit, error
    },
    sessionID: {
        type: String,
        required: false
    },
    deviceInfo: {
        os: String,
        version: String,
        model: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {} // Specific details about the screen (e.g., search params)
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically delete analytics after 30 days
    }
});

appAnalyticsSchema.index({ screenName: 1, timestamp: -1 });
appAnalyticsSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AppAnalytics', appAnalyticsSchema);
