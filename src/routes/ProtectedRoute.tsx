
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { getAccessToken, clearTokens } from "@/shared/api/authStorage";
import { getCurrentAdmin } from "@/services/auth.service";

export function ProtectedRoute() {
  const location = useLocation();

  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const token = getAccessToken();

      if (!token) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsChecking(false);
        }
        return;
      }

      try {
        await getCurrentAdmin();

        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch {
        clearTokens();

        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Verifying authentication...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
