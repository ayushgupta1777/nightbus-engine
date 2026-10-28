const QaFeedback = require('../models/QaFeedback');

// @desc Create a new QA Feedback / Issue Report
// @route POST /api/qa-feedback
exports.createFeedback = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      severity,
      route,
      screenName,
      userRole,
      userId,
      viewport,
      consoleLogs,
      metadata
    } = req.body;

    if (!description || !route) {
      return res.status(400).json({
        success: false,
        message: 'Description and current route are required.'
      });
    }

    const feedback = await QaFeedback.create({
      title: title || (description.length > 50 ? description.substring(0, 50) + '...' : description),
      description,
      type: type || 'bug',
      severity: severity || 'medium',
      route,
      screenName: screenName || 'Screen',
      userRole: userRole || 'customer',
      userId: userId || null,
      viewport: viewport || {},
      consoleLogs: Array.isArray(consoleLogs) ? consoleLogs : [],
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      data: feedback
    });
  } catch (error) {
    console.error('Error in createFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback.',
      error: error.message
    });
  }
};

// @desc Get all QA Feedback reports with optional filters
// @route GET /api/qa-feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const { status, type, severity, route, screenName, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (route) query.route = new RegExp(route, 'i');
    if (screenName) query.screenName = new RegExp(screenName, 'i');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await QaFeedback.countDocuments(query);
    const feedbackList = await QaFeedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: feedbackList
    });
  } catch (error) {
    console.error('Error in getAllFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback.',
      error: error.message
    });
  }
};

// @desc Get next pending issue for autonomous resolution
// @route GET /api/qa-feedback/next
exports.getNextPending = async (req, res) => {
  try {
    // Priority order: critical > high > medium > low
    const severityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    
    // Find all pending issues
    const pendingIssues = await QaFeedback.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    if (!pendingIssues || pendingIssues.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending issues found.',
        data: null
      });
    }

    // Sort by severity first, then oldest createdAt
    pendingIssues.sort((a, b) => {
      const aSev = severityOrder[a.severity] || 3;
      const bSev = severityOrder[b.severity] || 3;
      if (aSev !== bSev) return aSev - bSev;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const nextIssue = pendingIssues[0];

    res.status(200).json({
      success: true,
      data: nextIssue
    });
  } catch (error) {
    console.error('Error in getNextPending:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve next issue.',
      error: error.message
    });
  }
};

// @desc Get single feedback report by ID
// @route GET /api/qa-feedback/:id
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await QaFeedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback report not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback.',
      error: error.message
    });
  }
};

// @desc Update feedback status and resolution notes
// @route PATCH /api/qa-feedback/:id
exports.updateFeedback = async (req, res) => {
  try {
    const { status, aiResolutionNotes, severity, type } = req.body;
    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }
    }
    if (aiResolutionNotes !== undefined) updateData.aiResolutionNotes = aiResolutionNotes;
    if (severity) updateData.severity = severity;
    if (type) updateData.type = type;

    const feedback = await QaFeedback.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback report not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully.',
      data: feedback
    });
  } catch (error) {
    console.error('Error in updateFeedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback.',
      error: error.message
    });
  }
};

// @desc Delete feedback report
// @route DELETE /api/qa-feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await QaFeedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback report not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback.',
      error: error.message
    });
  }
};
