import { Route } from "wouter";

export function PublicRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}) {
  return <Route path={path} component={Component} />;
}