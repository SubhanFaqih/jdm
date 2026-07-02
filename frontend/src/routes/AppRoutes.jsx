import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { LoginPage } from '../pages/Login';

// Admin Pages
import { Dashboard } from '../pages/Admin/Dashboard';
import { UstadzPage } from '../pages/Admin/Ustadz';
import { JadwalKhotibPage } from '../pages/Admin/JadwalKhotib';
import { ProgramDonasiPage } from '../pages/Admin/ProgramDonasi';
import { KasPage } from '../pages/Admin/Kas';
import { ProfileMasjidPage } from '../pages/Admin/ProfileMasjid';
import { HadistPage } from '../pages/Admin/Hadist';
import { AuditLogPage } from '../pages/Admin/AuditLog';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public / Digital Signage */}
      <Route path="/" element={<Home />} />

      {/* Login Admin */}
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin Panel (Protected) */}
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="ustadz" element={<UstadzPage />} />
        <Route path="khotib" element={<JadwalKhotibPage />} />
        <Route path="donasi" element={<ProgramDonasiPage />} />
        <Route path="kas" element={<KasPage />} />
        <Route path="profile" element={<ProfileMasjidPage />} />
        <Route path="hadist" element={<HadistPage />} />
        <Route path="audit-logs" element={<AuditLogPage />} />
      </Route>
    </Routes>
  );
}
