import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { getRouter } from './routes';

export default function App() {
  const router = getRouter();
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
