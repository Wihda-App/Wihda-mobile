import { Outlet } from 'react-router';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthProvider>
        <div className="app-shell">
          <Outlet />
        </div>
      </AuthProvider>
    </AppProvider>
  );
}
