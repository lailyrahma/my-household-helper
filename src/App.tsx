import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import HouseDashboard from "./pages/HouseDashboard";
import StockManagement from "./pages/StockManagement";
import ShoppingList from "./pages/ShoppingList";
import Members from "./pages/Members";
import Reports from "./pages/Reports";
import Timeline from "./pages/Timeline";
import Predictions from "./pages/Predictions";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/house/:id" element={<HouseDashboard />} />
            <Route path="/house/:id/stock" element={<StockManagement />} />
            <Route path="/house/:id/shopping" element={<ShoppingList />} />
            <Route path="/house/:id/members" element={<Members />} />
            <Route path="/house/:id/reports" element={<Reports />} />
            <Route path="/house/:id/timeline" element={<Timeline />} />
            <Route path="/house/:id/predictions" element={<Predictions />} />
            <Route path="/house/:id/notifications" element={<Notifications />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
