import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Originals from "@/pages/originals";
import CasinoPage from "@/pages/casino";
import Admin from "@/pages/admin";
import InitDb from "@/pages/InitDb";
import AuthPage from "@/pages/auth-page";
import WalletPage from "@/pages/wallet-page";
import VaultPage from "@/pages/vault-page";
import VIPPage from "@/pages/vip-page";
import AffiliatePage from "@/pages/affiliate-page";
import StatisticsPage from "@/pages/statistics-page";
import TransactionsPage from "@/pages/transactions-page";
import BetsPage from "@/pages/bets-page";
import SettingsPage from "@/pages/settings-page";
import StakeSmartPage from "@/pages/stake-smart-page";
import SupportPage from "@/pages/support-page";
import AnimationExamples from "@/pages/animation-examples";
import RecentPage from "@/pages/recent-page";
import Layout from "@/components/layout/Layout";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

function Router() {
  return (
    <UserProvider>
      <SidebarProvider>
        <Layout>
          <Switch>
            <ProtectedRoute path="/" component={Home} />
            <ProtectedRoute path="/games/:gameSlug" component={Game} />
            <ProtectedRoute path="/casino/games/:gameSlug" component={Game} />
            <ProtectedRoute path="/casino" component={CasinoPage} />
            <ProtectedRoute path="/originals" component={Originals} />
            <ProtectedRoute path="/admin" component={Admin} />
            <Route path="/init-db" component={InitDb} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/wallet" component={WalletPage} />
            <ProtectedRoute path="/vault" component={VaultPage} />
            <ProtectedRoute path="/vip" component={VIPPage} />
            <ProtectedRoute path="/affiliate" component={AffiliatePage} />
            <ProtectedRoute path="/statistics" component={StatisticsPage} />
            <ProtectedRoute path="/transactions" component={TransactionsPage} />
            <ProtectedRoute path="/bets" component={BetsPage} />
            <ProtectedRoute path="/recent" component={RecentPage} />
            <ProtectedRoute path="/settings" component={SettingsPage} />
            <ProtectedRoute path="/stake-smart" component={StakeSmartPage} />
            <ProtectedRoute path="/support" component={SupportPage} />
            <Route path="/animation-examples" component={AnimationExamples} />
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </SidebarProvider>
    </UserProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CurrencyProvider>
          <Router />
          <Toaster />
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;