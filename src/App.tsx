import React, { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index.tsx";
const Shop = lazy(() => import("./pages/Shop.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess.tsx"));
const FactureDetail = lazy(() => import("./pages/FactureDetail.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const Trainings = lazy(() => import("./pages/Trainings.tsx"));
const TrainingDetail = lazy(() => import("./pages/TrainingDetail.tsx"));
const DevisPage = lazy(() => import("./pages/DevisPage.tsx"));
const TroupeauPage = lazy(() => import("./pages/TroupeauPage.tsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.tsx"));
const PartnerPage = lazy(() => import("./pages/PartnerPage.tsx"));
const InstantQuoteGenerator = lazy(() => import("./pages/InstantQuoteGenerator.tsx"));
const InstantQuoteView = lazy(() => import("./pages/InstantQuoteView.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard.tsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.tsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const InventoryManagement = lazy(() => import("./pages/admin/InventoryManagement.tsx"));
const OrdersManagement = lazy(() => import("./pages/admin/OrdersManagement.tsx"));
const CustomersManagement = lazy(() => import("./pages/admin/CustomersManagement.tsx"));
const PromotionsManagement = lazy(() => import("./pages/admin/PromotionsManagement.tsx"));
const UsersManagement = lazy(() => import("./pages/admin/UsersManagement.tsx"));
const CategoriesManagement = lazy(() => import("./pages/admin/CategoriesManagement.tsx"));
const BlogManagement = lazy(() => import("./pages/admin/BlogManagement.tsx"));
const BlogEditor = lazy(() => import("./pages/admin/BlogEditor.tsx"));
const QuotesManagement = lazy(() => import("./pages/admin/QuotesManagement.tsx"));
const ServicesManagement = lazy(() => import("./pages/admin/ServicesManagement.tsx"));
const SettingsManagement = lazy(() => import("./pages/admin/SettingsManagement.tsx"));
const TrainingsManagement = lazy(() => import("./pages/admin/TrainingsManagement.tsx"));
const TrainingSubscriptions = lazy(() => import("./pages/admin/TrainingSubscriptions.tsx"));
const InstantQuotesManagement = lazy(() => import("./pages/admin/InstantQuotesManagement.tsx"));
const AdminFarmsManagement = lazy(() => import("@/modules/farm/pages/AdminFarmsManagement"));

// Devis Module Imports
const HomeDevis = lazy(() => import("@/modules/quote-hub/pages/Home.tsx"));
const QuoteRequestDevis = lazy(() => import("@/modules/quote-hub/pages/QuoteRequest.tsx"));
const PaymentSuccessDevis = lazy(() => import("@/modules/quote-hub/pages/PaymentSuccess.tsx"));
const NavigationDevis = lazy(() => import("@/modules/quote-hub/components/Navigation.tsx"));

const queryClient = new QueryClient();
const isDevisModule = window.location.hostname.startsWith('devis');

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
          <Routes>
            {/* Admin Secure Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'editor', 'seo', 'stock_manager']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                
                {/* Stock Manager & Admin: inventory, categories, orders */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'stock_manager']} />}>
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="categories" element={<CategoriesManagement />} />
                  <Route path="orders" element={<OrdersManagement />} />
                </Route>

                {/* Editor, SEO & Admin: blog */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'editor', 'seo']} />}>
                  <Route path="blog" element={<BlogManagement />} />
                  <Route path="blog/new" element={<BlogEditor />} />
                  <Route path="blog/edit/:id" element={<BlogEditor />} />
                </Route>

                {/* Admin-only: system settings, user management, customers, promotions, quotes, trainings, etc. */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="customers" element={<CustomersManagement />} />
                  <Route path="farms" element={<AdminFarmsManagement />} />
                  <Route path="promotions" element={<PromotionsManagement />} />
                  <Route path="settings" element={<SettingsManagement />} />
                  <Route path="team" element={<UsersManagement />} />
                  <Route path="quotes" element={<QuotesManagement />} />
                  <Route path="services" element={<ServicesManagement />} />
                  <Route path="trainings" element={<TrainingsManagement />} />
                  <Route path="training-subscriptions" element={<TrainingSubscriptions />} />
                  <Route path="instant-quotes" element={<InstantQuotesManagement />} />
                </Route>

                <Route path="*" element={<Dashboard />} />
              </Route>
            </Route>

            {/* Devis Module Public Routes */}
            {isDevisModule && (
              <Route element={
                <div className="min-h-screen bg-background">
                  <NavigationDevis />
                  <Outlet />
                </div>
              }>
                <Route path="/" element={<HomeDevis />} />
                <Route path="/quote" element={<QuoteRequestDevis />} />
                <Route path="/payment-success" element={<PaymentSuccessDevis />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            )}

            {/* Main App Public Routes */}
            {!isDevisModule && (
              <Route element={
                <CartProvider>
                  <CartDrawer />
                  <Outlet />
                </CartProvider>
              }>
                <Route path="/" element={<Index />} />
                <Route path="/boutique" element={<Shop />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/merci" element={<OrderSuccess />} />
                <Route path="/facture/:id" element={<FactureDetail />} />
                <Route path="/produit/:slug" element={<ProductDetail />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/mon-compte" element={<CustomerDashboard />} />

                {/* Formations Module Public Routes */}
                <Route path="/formations" element={<Trainings />} />
                <Route path="/formations/:id" element={<TrainingDetail />} />

                {/* Service Landing Pages */}
                <Route path="/devis" element={<DevisPage />} />
                <Route path="/devis/generateur/:templateId" element={<InstantQuoteGenerator />} />
                <Route path="/mes-devis/resultat/:id" element={<InstantQuoteView />} />
                <Route path="/troupeau" element={<TroupeauPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/partenaire" element={<PartnerPage />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            )}
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
