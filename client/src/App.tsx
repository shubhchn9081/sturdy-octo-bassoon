import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Originals from "@/pages/originals";
import Admin from "@/pages/admin";
import InitDb from "@/pages/InitDb";
import AuthPage from "@/pages/auth-page";
import WalletPage from "@/pages/wallet-page";
import Layout from "@/components/layout/Layout";
import { UserProvider } from "@/context/UserContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games/:gameSlug" component={Game} />
      <Route path="/casino/games/:gameSlug" component={Game} />
      <Route path="/originals" component={Originals} />
      <Route path="/admin" component={Admin} />
      <Route path="/init-db" component={InitDb} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/wallet" component={WalletPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <UserProvider>
      <Router />
      <Toaster />
    </UserProvider>
  );
}

export default App;