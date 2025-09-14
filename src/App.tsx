import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTheme } from "@/hooks/useTheme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BrandSelector from "./pages/BrandSelector";
import BrandPage from "./pages/BrandPage";
import AppDashboard from "./pages/App";
import BrandNubank from "./pages/BrandNubank";
import BrandSantander from "./pages/BrandSantander";
import BrandItau from "./pages/BrandItau";
import BrandInter from "./pages/BrandInter";
import BrandC6 from "./pages/BrandC6";
import BrandUtmify from "./pages/BrandUtmify";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboardSimple from "./pages/admin/AdminDashboardSimple";
import AdminUsersSimple from "./pages/admin/AdminUsersSimple";
import AdminSubscriptionsSimple from "./pages/admin/AdminSubscriptionsSimple";
import AdminSimple from "./pages/admin/AdminSimple";
import AdminUserApproval from "./pages/admin/AdminUserApproval";
import AdminCreateUser from "./pages/admin/AdminCreateUser";
import AdminWebhookIntegrations from "./pages/admin/AdminWebhookIntegrations";
import AdminCheckoutLinks from "./pages/admin/AdminCheckoutLinks";
import SupabaseTest from "./components/SupabaseTest";
import ImageTest from "./components/ImageTest";

const queryClient = new QueryClient();

const AppContent = () => {
  // Initialize theme
  useTheme();
  
  return (
    <BrowserRouter>
        <Routes>
                  {/* Login obrigatório - redireciona para login se não autenticado */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/brand" element={
                    <ProtectedRoute requireAuth={true}>
                      <BrandSelector />
                    </ProtectedRoute>
                  } />
          <Route path="/brand/nubank" element={<BrandNubank />} />
          <Route path="/brand/santander" element={<BrandSantander />} />
          <Route path="/brand/itau" element={<BrandItau />} />
          <Route path="/brand/inter" element={<BrandInter />} />
          <Route path="/brand/c6" element={<BrandC6 />} />
          <Route path="/brand/utmify" element={<BrandUtmify />} />
          <Route path="/brand/:slug" element={<BrandPage />} />
          <Route path="/app" element={<AppDashboard />} />
          <Route path="/dashboard" element={<Index />} />
          
          {/* Auth Routes - Sem proteção */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Teste Supabase */}
          <Route path="/test-supabase" element={<SupabaseTest />} />
          
          {/* Teste de Imagens */}
          <Route path="/test-images" element={<ImageTest />} />
          
          {/* Admin Routes - Proteção especial para admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/simple" element={
            <ProtectedRoute requireAuth={true} adminOnly={true}>
              <AdminSimple />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAuth={true} adminOnly={true}>
              <AdminDashboardSimple />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireAuth={true} adminOnly={true}>
              <AdminUsersSimple />
            </ProtectedRoute>
          } />
          <Route path="/admin/approval" element={
            <ProtectedRoute requireAuth={true} adminOnly={true}>
              <AdminUserApproval />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-user" element={
            <ProtectedRoute requireAuth={true} adminOnly={true}>
              <AdminCreateUser />
            </ProtectedRoute>
          } />
          <Route path="/admin/subscriptions" element={
            <ProtectedRoute requireAuth={true} adminOnly={true}>
              <AdminSubscriptionsSimple />
            </ProtectedRoute>
          } />
          <Route path="/admin/webhooks" element={
            <ProtectedRoute requireAuth={true} adminOnly={true}>
              <AdminWebhookIntegrations />
            </ProtectedRoute>
          } />
          <Route path="/admin/checkout" element={
            <ProtectedRoute requireAuth={true} adminOnly={true}>
              <AdminCheckoutLinks />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
