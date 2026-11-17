
import { useEffect, useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";

import { AppSidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import {
  getAccessToken,
  clearTokens,
} from "@/shared/api/authStorage";

import {
  getCurrentAdmin,
  logoutAdmin,
  type AdminUser,
} from "@/services/auth.service";

export function ProtectedLayout() {
  const location = useLocation();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const token = getAccessToken();

      if (!token) {
        if (isMounted) setIsChecking(false);
        return;
      }

      try {
        const admin = await getCurrentAdmin();

        if (isMounted) {
          setUser(admin);
        }
      } catch {
        clearTokens();

        if (isMounted) {
          setUser(null);
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

const handleGlobalLogout = () => {
  logoutAdmin();
  setUser(null);
  window.location.href = "/login";
};

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Verifying authentication...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="relative isolate flex flex-col flex-1 min-w-0 min-h-screen overflow-x-hidden bg-background [transform:translate(0,0)]">
        <DashboardHeader
          user={{
            name: user.email,
            email: user.email,
            avatar: "",
          }}
          onLogout={handleGlobalLogout}
        />

        <main
          id="dialog-root"
          className="relative flex-1 p-4 md:p-6 lg:p-8 w-full mx-auto"
        >
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
