import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import jwsRoutes from './routes/jwsRoutes.js';
import hadistRoutes from './routes/hadistRoutes.js';
import ustadzRoutes from './routes/ustadzRoutes.js';
import jadwalKhotibRoutes from './routes/jadwalKhotibRoutes.js';
import programDonasiRoutes from './routes/programDonasiRoutes.js';
import kasRoutes from './routes/kasRoutes.js';
import profileMasjidRoutes from './routes/profileMasjidRoutes.js';
import { initScheduler } from './services/schedulerService.js';

dotenv.config();

const app = express();

await connectDB();
initScheduler();

app.use(express.json());

app.use("/api/jws", jwsRoutes);
app.use("/api/hadist", hadistRoutes);
app.use("/api/ustadz", ustadzRoutes);
app.use("/api/jadwal-khotib", jadwalKhotibRoutes);
app.use("/api/program-donasi", programDonasiRoutes);
app.use("/api/kas", kasRoutes);
app.use("/api/profile-masjid", profileMasjidRoutes);

app.get('/', (req, res) => {
  res.send("Hello World");
})

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
