import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Game from "@/pages/game";
import Originals from "@/pages/originals";
import CasinoPage from "@/pages/casino";
import AdminPage from "@/pages/admin-page";
import InitDb from "@/pages/InitDb";
import AuthPage from "@/pages/auth-page";
import WalletPage from "@/pages/wallet-page";
import RechargePage from "@/pages/recharge-page";
import WithdrawPage from "@/pages/withdraw-page";
import PaymentSuccessPage from "@/pages/payment-success";
import PaymentFailurePage from "@/pages/payment-failure";
import VaultPage from "@/pages/vault-page";
import VIPPage from "@/pages/vip-page";
import AffiliatePage from "@/pages/affiliate-page";
import StatisticsPage from "@/pages/statistics-page";
import TransactionsPage from "@/pages/transactions-page";
import BetsPage from "@/pages/bets-page";
import SettingsPage from "@/pages/settings-page";
import NovitoSmartPage from "@/pages/novito-smart-page";
import SupportPage from "@/pages/support-page";
import AnimationExamples from "@/pages/animation-examples";
import RecentPage from "@/pages/recent-page";
import SportsPage from "@/pages/sports-page";
import ChatPage from "@/pages/chat-page";
import HelpCenterPage from "@/pages/help-center-page";
import FairnessPage from "@/pages/fairness-page";
import VIPClubPage from "@/pages/vip-club-page";
import SponsorshipsPage from "@/pages/sponsorships-page";
import PaymentInfoPage from "@/pages/payment-info-page";
import GuidesPage from "@/pages/guides-page";
import PromotionsPage from "@/pages/promotions-page";
import AccountPage from "@/pages/account-page";
import SlotsPage from "@/pages/slots-page";
import Layout from "@/components/layout/Layout";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { WalletProvider } from "@/context/WalletContext";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminRoute } from "@/lib/admin-route";
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
            <ProtectedRoute path="/slots" component={SlotsPage} />
            <ProtectedRoute path="/originals" component={Originals} />
            <ProtectedRoute path="/sports" component={SportsPage} />
            <Route path="/admin">
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            </Route>
            <Route path="/init-db" component={InitDb} />
            <Route path="/auth" component={AuthPage} />
            <ProtectedRoute path="/wallet" component={WalletPage} />
            <ProtectedRoute path="/recharge" component={RechargePage} />
            <ProtectedRoute path="/withdraw" component={WithdrawPage} />
            <ProtectedRoute path="/payment-success" component={PaymentSuccessPage} />
            <ProtectedRoute path="/payment-failure" component={PaymentFailurePage} />
            <ProtectedRoute path="/vault" component={VaultPage} />
            <ProtectedRoute path="/vip" component={VIPPage} />
            <ProtectedRoute path="/affiliate" component={AffiliatePage} />
            <ProtectedRoute path="/statistics" component={StatisticsPage} />
            <ProtectedRoute path="/transactions" component={TransactionsPage} />
            <ProtectedRoute path="/bets" component={BetsPage} />
            <ProtectedRoute path="/recent" component={RecentPage} />
            <ProtectedRoute path="/settings" component={SettingsPage} />
            <ProtectedRoute path="/novito-smart" component={NovitoSmartPage} />
            <ProtectedRoute path="/support" component={SupportPage} />
            <ProtectedRoute path="/chat" component={ChatPage} />
            <ProtectedRoute path="/help-center" component={HelpCenterPage} />
            <ProtectedRoute path="/fairness" component={FairnessPage} />
            <ProtectedRoute path="/vip-club" component={VIPClubPage} />
            <ProtectedRoute path="/sponsorships" component={SponsorshipsPage} />
            <ProtectedRoute path="/payment-info" component={PaymentInfoPage} />
            <ProtectedRoute path="/guides" component={GuidesPage} />
            <ProtectedRoute path="/promotions" component={PromotionsPage} />
            <ProtectedRoute path="/account" component={AccountPage} />
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
          <WalletProvider>
            <Router />
            <Toaster />
          </WalletProvider>
        </CurrencyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;