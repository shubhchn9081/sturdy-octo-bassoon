import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../hooks/use-auth";
import { Loader2 } from "lucide-react";

type AuthCheckProps = {
  children: ReactNode;
  redirectTo?: string;
};

export default function AuthCheck({ children, redirectTo = "/auth" }: AuthCheckProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Only render children if authenticated
  return user ? <>{children}</> : null;
}