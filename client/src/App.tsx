import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Originals from "@/pages/originals";
import Admin from "@/pages/admin";
import InitDb from "@/pages/InitDb";
import AuthPage from "@/pages/auth-page";
import Layout from "@/components/layout/Layout";
import { AuthProvider } from "@/hooks/use-auth";
import AuthCheck from "@/components/layout/AuthCheck";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AuthCheck>
          <Home />
        </AuthCheck>
      </Route>
      <Route path="/games/:gameSlug">
        <AuthCheck>
          <Game />
        </AuthCheck>
      </Route>
      <Route path="/casino/games/:gameSlug">
        <AuthCheck>
          <Game />
        </AuthCheck>
      </Route>
      <Route path="/originals">
        <AuthCheck>
          <Originals />
        </AuthCheck>
      </Route>
      <Route path="/admin">
        <AuthCheck>
          <Admin />
        </AuthCheck>
      </Route>
      <Route path="/init-db">
        <InitDb />
      </Route>
      <Route path="/auth">
        <AuthPage />
      </Route>
      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
