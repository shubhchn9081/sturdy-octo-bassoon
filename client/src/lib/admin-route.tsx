import { ReactNode, useEffect } from "react";
import { useAuth } from "../providers/auth-provider";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * A component that checks if the current user is an admin
 * and redirects to the home page if not
 */
export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      // If not an admin, redirect to home
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Only render children if user is an admin
  if (user?.isAdmin) {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
};