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
import Layout from "@/components/layout/Layout";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import { ClerkProviderWrapper } from "@/lib/clerk-provider";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <UserProvider>
      <SidebarProvider>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/games/:gameSlug" component={Game} />
            <Route path="/casino/games/:gameSlug" component={Game} />
            <Route path="/originals" component={Originals} />
            <Route path="/admin" component={Admin} />
            <Route path="/init-db" component={InitDb} />
            <Route path="/auth" component={AuthPage} />
            <Route path="/wallet" component={WalletPage} />
            <Route path="/vault" component={VaultPage} />
            <Route path="/vip" component={VIPPage} />
            <Route path="/affiliate" component={AffiliatePage} />
            <Route path="/statistics" component={StatisticsPage} />
            <Route path="/transactions" component={TransactionsPage} />
            <Route path="/bets" component={BetsPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/stake-smart" component={StakeSmartPage} />
            <Route path="/support" component={SupportPage} />
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
    <ClerkProviderWrapper>
      <Router />
      <Toaster />
    </ClerkProviderWrapper>
  );
}

export default App;