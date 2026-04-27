import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Buses from "@/pages/buses";
import Seats from "@/pages/seats";
import PassengerPage from "@/pages/passenger";
import Confirmation from "@/pages/confirmation";
import MyBookings from "@/pages/my-bookings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!user) return null;
  return <Component />;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <PageWrapper key={location}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/buses" component={Buses} />
            <Route path="/seats/:busId">
              {() => <ProtectedRoute component={Seats} />}
            </Route>
            <Route path="/passenger/:busId">
              {() => <ProtectedRoute component={PassengerPage} />}
            </Route>
            <Route path="/confirmation/:pnr">
              {() => <ProtectedRoute component={Confirmation} />}
            </Route>
            <Route path="/my-bookings">
              {() => <ProtectedRoute component={MyBookings} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </PageWrapper>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
