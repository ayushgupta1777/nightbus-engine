const mongoose = require('mongoose');
const SystemLog = require('../models/SystemLog');
const AppAnalytics = require('../models/AppAnalytics');

// Utility to get all registered Mongoose models
const getAvailableModels = () => {
  return mongoose.modelNames();
};

exports.getCollections = async (req, res) => {
  try {
    const models = getAvailableModels();
    res.status(200).json({ success: true, collections: models });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCollectionData = async (req, res) => {
  try {
    const { collectionName } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const models = getAvailableModels();
    if (!models.includes(collectionName)) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const Model = mongoose.model(collectionName);
    const data = await Model.find().sort({ _id: -1 }).limit(limit).lean();

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { collectionName, id } = req.params;

    const models = getAvailableModels();
    if (!models.includes(collectionName)) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const Model = mongoose.model(collectionName);
    const document = await Model.findById(id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Special case for User: Cascade Hard Delete
    if (collectionName === 'User') {
      const userRole = document.role;

      // 1. Delete associated data based on role
      if (userRole === 'customer') {
          if (models.includes('Journey')) await mongoose.model('Journey').deleteMany({ passenger: id });
          if (models.includes('Segment')) await mongoose.model('Segment').deleteMany({ user: id });
          if (models.includes('FoodOrder')) await mongoose.model('FoodOrder').deleteMany({ user: id });
          if (models.includes('Review')) await mongoose.model('Review').deleteMany({ user: id });
          if (models.includes('RentalRequest')) await mongoose.model('RentalRequest').deleteMany({ user: id });
      } else if (userRole === 'owner') {
          if (models.includes('Bus')) await mongoose.model('Bus').deleteMany({ ownerId: id });
          if (models.includes('Route')) await mongoose.model('Route').deleteMany({ ownerId: id });
          if (models.includes('OwnerRouteConfig')) await mongoose.model('OwnerRouteConfig').deleteMany({ ownerId: id });
          if (models.includes('RentalService')) await mongoose.model('RentalService').deleteMany({ provider: id });
          if (models.includes('Settlement')) await mongoose.model('Settlement').deleteMany({ ownerId: id });
      } else if (userRole === 'vendor' || document.isFoodVendor) {
          if (models.includes('FoodVendor')) await mongoose.model('FoodVendor').deleteMany({ owner: id });
          if (models.includes('VendorProduct')) await mongoose.model('VendorProduct').deleteMany({ vendor: id });
          if (models.includes('VendorOrder')) await mongoose.model('VendorOrder').deleteMany({ vendor: id });
          if (models.includes('Settlement')) await mongoose.model('Settlement').deleteMany({ ownerId: id });
      }

      // 2. Global cleanups for the user
      if (models.includes('Wallet')) await mongoose.model('Wallet').deleteMany({ user: id });
      if (models.includes('WalletTransaction')) await mongoose.model('WalletTransaction').deleteMany({ user: id });
      if (models.includes('Message')) await mongoose.model('Message').deleteMany({ $or: [{ sender: id }, { receiver: id }] });
      if (models.includes('Notification')) await mongoose.model('Notification').deleteMany({ user: id });
      
      await Model.findByIdAndDelete(id);
      
      return res.status(200).json({ success: true, message: 'User and all associated cascade data HARD DELETED successfully' });
    }

    // Normal generic delete for other collections
    await Model.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: `Document from ${collectionName} deleted successfully` });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await SystemLog.find().sort({ timestamp: -1 }).limit(limit).lean();
    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const analytics = await AppAnalytics.find().sort({ timestamp: -1 }).limit(limit).lean();
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Endpoint for the mobile app to post analytics
exports.postAnalytics = async (req, res) => {
  try {
    const { userId, role, screenName, action, sessionID, deviceInfo, metadata } = req.body;
    
    await AppAnalytics.create({
      userId: userId || null,
      role: role || 'anonymous',
      screenName,
      action,
      sessionID,
      deviceInfo,
      metadata
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const DeveloperConfig = require('../models/DeveloperConfig');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    let config = await DeveloperConfig.findOne({ key: 'masterPassword' });
    
    // If no password set in DB, fallback to default 'AYUSHSLS'
    if (!config) {
      if (password === 'AYUSHSLS') {
        return res.status(200).json({ success: true, token: 'dev-bypass-token', user: { role: 'developer', id: 'dev-1', email: 'dev@system.local' } });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid Developer Password' });
      }
    }

    // Compare with hashed password from DB
    const isMatch = await bcrypt.compare(password, config.value);
    if (isMatch) {
      return res.status(200).json({ success: true, token: 'dev-bypass-token', user: { role: 'developer', id: 'dev-1', email: 'dev@system.local' } });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid Developer Password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    let config = await DeveloperConfig.findOne({ key: 'masterPassword' });

    // Validate current password
    if (!config) {
      if (currentPassword !== 'AYUSHSLS') {
        return res.status(401).json({ success: false, message: 'Current password incorrect' });
      }
    } else {
      const isMatch = await bcrypt.compare(currentPassword, config.value);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Current password incorrect' });
      }
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (config) {
      config.value = hashedPassword;
      await config.save();
    } else {
      await DeveloperConfig.create({ key: 'masterPassword', value: hashedPassword });
    }

    res.status(200).json({ success: true, message: 'Master Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const os = require('os');

exports.getHealth = async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;
    
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    const uptime = os.uptime();
    const processUptime = process.uptime();

    res.status(200).json({
      success: true,
      health: {
        memory: {
          total: totalMem,
          free: freeMem,
          used: usedMem,
          percent: memUsagePercent.toFixed(2)
        },
        cpu: {
          cores: cpus.length,
          model: cpus[0].model,
          load: loadAvg
        },
        uptime: {
          system: uptime,
          node: processUptime
        },
        timestamp: Date.now()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.postCrashReport = async (req, res) => {
  try {
    const { error, errorInfo, deviceInfo } = req.body;
    
    await SystemLog.create({
      level: 'critical',
      message: `[MOBILE CRASH] ${error || 'Unknown Error'}`,
      source: 'mobile_app',
      meta: {
        stack: errorInfo,
        deviceInfo
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
