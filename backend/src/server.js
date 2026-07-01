import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import connectDB from './config/db.js';
import jwsRoutes from './routes/jwsRoutes.js';
import hadistRoutes from './routes/hadistRoutes.js';
import ustadzRoutes from './routes/ustadzRoutes.js';
import jadwalKhotibRoutes from './routes/jadwalKhotibRoutes.js';
import programDonasiRoutes from './routes/programDonasiRoutes.js';
import kasRoutes from './routes/kasRoutes.js';
import profileMasjidRoutes from './routes/profileMasjidRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import wilayahRoutes from './routes/wilayahRoutes.js';
import { initScheduler } from './services/schedulerService.js';
import { initSocket } from './services/socketService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

await connectDB();
initScheduler();

app.use(express.json());
// Expose the public/uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use("/api/jws", jwsRoutes);
app.use("/api/hadist", hadistRoutes);
app.use("/api/ustadz", ustadzRoutes);
app.use("/api/jadwal-khotib", jadwalKhotibRoutes);
app.use("/api/program-donasi", programDonasiRoutes);
app.use("/api/kas", kasRoutes);
app.use("/api/profile-masjid", profileMasjidRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/wilayah", wilayahRoutes);

app.get('/', (req, res) => {
  res.send("Hello World");
})

httpServer.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT} (with WebSockets)`);
});
