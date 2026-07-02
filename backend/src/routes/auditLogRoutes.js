import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAuditLogs);

export default router;
