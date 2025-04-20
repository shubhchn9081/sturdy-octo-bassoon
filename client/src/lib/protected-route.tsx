import { useAuth, useUser } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { Redirect, Route } from 'wouter';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  path: string;
  component: () => ReactNode;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If not signed in, redirect to auth page
  if (!isSignedIn || !user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // User is authenticated, render the component
  return <Route path={path} component={Component as any} />;
}