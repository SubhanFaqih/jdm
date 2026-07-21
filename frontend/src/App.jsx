import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { TimeProvider } from './context/TimeContext';
import { PrayerStateProvider } from './context/PrayerStateContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <TimeProvider>
            <PrayerStateProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </PrayerStateProvider>
          </TimeProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
