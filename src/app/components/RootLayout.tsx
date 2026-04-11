import { Outlet } from 'react-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import Sidebar from './Sidebar';

/**
 * Inner layout — can use context because it renders inside the providers.
 * On mobile: full-screen, no sidebar, content fills viewport.
 * On tablet/desktop (md+): sidebar is fixed on the left (w-16 tablet / w-56 desktop),
 * content is offset right by the same amount.
 */
function Layout() {
  const { user } = useAuth();

  return (
    <div className="h-dvh flex overflow-hidden">
      {/* Left sidebar — renders nothing on mobile, nothing when logged out */}
      <Sidebar />

      {/* Main content — offset only when sidebar is present */}
      <div className={`flex-1 h-full overflow-hidden ${user ? 'md:pl-16 lg:pl-56' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </AppProvider>
  );
}
