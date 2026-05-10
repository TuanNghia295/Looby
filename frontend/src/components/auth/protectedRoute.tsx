import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';

function ProtectedRoute() {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);
  useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        await refresh();
      }

      if (accessToken && !user) {
        await fetchMe();
      }
      setStarting(false);
    };

    init();
  }, []);

  if (starting || loading) {
    return (
      <div className="flex  h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to={'/signin'} replace></Navigate>;
  }
  return (
    // Outlet: hiển thị các route con bên trong route cha
    <Outlet></Outlet>
  );
}

export default ProtectedRoute;
