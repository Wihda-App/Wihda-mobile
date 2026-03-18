import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { getRouter } from './routes';

export default function App() {
  const router = getRouter();

  useEffect(() => {
    LocalNotifications.requestPermissions().catch(() => {});
    const listenerPromise = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (action: any) => {
        const extra = action.notification?.extra;
        if (extra?.submissionId) {
          router.navigate(`/cleanify-result/${extra.submissionId}`);
        }
      }
    );
    return () => { listenerPromise.then(l => l.remove()); };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#14ae5c',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: '12px 20px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 8px 30px rgba(20, 174, 92, 0.25)',
          },
        }}
        offset={60}
      />
    </>
  );
}
