import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Originals from "@/pages/originals";
import Layout from "@/components/layout/Layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/games/:gameSlug" component={Game} />
      <Route path="/casino/games/:gameSlug" component={Game} />
      <Route path="/originals" component={Originals} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
