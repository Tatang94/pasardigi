import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Cart from "@/pages/Cart";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminPage from "@/pages/AdminPage";
import AdminOnly from "@/pages/AdminOnly";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Auto-redirect admin users to admin dashboard
  const HomeComponent = () => {
    if (!isAuthenticated) return <Landing />;
    if (user?.isAdmin) return <Redirect to="/admin" />;
    return <Home />;
  };

  return (
    <Switch>
      <Route path="/" component={HomeComponent} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={isAuthenticated ? Products : () => <Redirect to="/auth" />} />
      <Route path="/cart" component={isAuthenticated ? Cart : () => <Redirect to="/auth" />} />
      <Route path="/dashboard" component={isAuthenticated ? UserDashboard : () => <Redirect to="/auth" />} />
      <Route path="/admin" component={AdminOnly} />
      <Route path="/admin-dashboard" component={isAuthenticated ? AdminDashboard : () => <Redirect to="/auth" />} />
      <Route path="/admin-panel" component={isAuthenticated ? AdminPage : () => <Redirect to="/auth" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
