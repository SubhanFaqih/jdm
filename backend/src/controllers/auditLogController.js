import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res) => {
  try {
    // Only fetch the last 100 logs to keep it light
    const logs = await AuditLog.find().populate('userId', 'name username').sort({ performedAt: -1 }).limit(100);
    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error("Error in getAuditLogs:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve audit logs.", error: error.message });
  }
};
