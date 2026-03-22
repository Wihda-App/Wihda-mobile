import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { apiFetch } from './lib/api';
import { getRouter } from './routes';

export default function App() {
  const router = getRouter();

  useEffect(() => {
    // Status bar — transparent on iOS, solid white on Android
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    }

    // Local notifications (cleanify)
    LocalNotifications.requestPermissions().catch(() => {});
    const localListenerPromise = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (action: any) => {
        const extra = action.notification?.extra;
        if (extra?.submissionId) {
          router.navigate(`/cleanify-result/${extra.submissionId}`);
        }
      }
    );

    // Push notifications (FCM — only on native iOS/Android)
    let pushListeners: Promise<{ remove: () => void }>[] = [];
    if (Capacitor.isNativePlatform()) {
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      }).catch(() => {});

      // Save FCM token to backend
      const regListener = PushNotifications.addListener('registration', async (token) => {
        try {
          await apiFetch('/v1/profile', {
            method: 'PATCH',
            body: JSON.stringify({ fcm_token: token.value }),
          });
        } catch {}
      });

      // Handle notification tap (app in background / closed)
      const actionListener = PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: any) => {
          const data = action.notification?.data;
          if (data?.thread_id) {
            router.navigate(`/chat/${data.thread_id}`);
          } else if (data?.submissionId) {
            router.navigate(`/cleanify-result/${data.submissionId}`);
          }
        }
      );

      pushListeners = [regListener, actionListener];
    }

    // Deep link handler — catches com.wihda.app://auth/google/callback?tokens
    let appUrlListener: Promise<{ remove: () => void }> | null = null;
    if (Capacitor.isNativePlatform()) {
      appUrlListener = CapApp.addListener('appUrlOpen', async (event) => {
        const url = new URL(event.url);
        if (url.pathname === '/auth/google/callback') {
          await Browser.close().catch(() => {});
          const accessToken = url.searchParams.get('access_token');
          const refreshToken = url.searchParams.get('refresh_token');
          const error = url.searchParams.get('error');
          if (accessToken) {
            router.navigate(`/auth/google/callback?access_token=${accessToken}&refresh_token=${refreshToken || ''}`);
          } else if (error) {
            router.navigate('/login');
          }
        } else if (url.searchParams.get('thread_id')) {
          router.navigate(`/chat/${url.searchParams.get('thread_id')}`);
        }
      });
    }

    return () => {
      localListenerPromise.then(l => l.remove());
      pushListeners.forEach(p => p.then(l => l.remove()));
      appUrlListener?.then(l => l.remove());
    };
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
