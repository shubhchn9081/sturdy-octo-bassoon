/**
 * Utility for handling route redirections and authentication
 */

// Key for storing intended route in localStorage
const INTENDED_ROUTE_KEY = 'intended_route';

/**
 * Save the current route as the intended destination
 * @param route The route to save as intended destination
 */
export const saveIntendedRoute = (route: string): void => {
  // Don't save auth-related routes as intended destinations
  if (route === '/auth' || route === '/login' || route === '/register') {
    return;
  }
  
  // Save the current path to localStorage
  localStorage.setItem(INTENDED_ROUTE_KEY, route);
};

/**
 * Get and clear the intended route
 * @returns The previously saved intended route, or null if none exists
 */
export const getAndClearIntendedRoute = (): string | null => {
  const route = localStorage.getItem(INTENDED_ROUTE_KEY);
  localStorage.removeItem(INTENDED_ROUTE_KEY);
  return route;
};

/**
 * Check if a route should be protected
 * This can be expanded to handle more complex route protection rules
 * @param path The route path to check
 * @returns True if the route should be protected, false otherwise
 */
export const shouldProtectRoute = (path: string): boolean => {
  // Routes that are public (not protected)
  const publicRoutes = ['/', '/auth', '/login', '/register', '/init-db', '/animation-examples'];
  
  // Check if path starts with any of the public routes
  for (const route of publicRoutes) {
    if (path === route || (route !== '/' && path.startsWith(route + '/'))) {
      return false;
    }
  }
  
  return true;
};