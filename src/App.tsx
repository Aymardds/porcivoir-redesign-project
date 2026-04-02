import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderSuccess from "./pages/OrderSuccess.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import QuoteRequest from "./pages/QuoteRequest.tsx";
import NotFound from "./pages/NotFound.tsx";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import Dashboard from "./pages/admin/Dashboard.tsx";
import InventoryManagement from "./pages/admin/InventoryManagement.tsx";
import OrdersManagement from "./pages/admin/OrdersManagement.tsx";
import CustomersManagement from "./pages/admin/CustomersManagement.tsx";
import PromotionsManagement from "./pages/admin/PromotionsManagement.tsx";
import UsersManagement from "./pages/admin/UsersManagement.tsx";
import CategoriesManagement from "./pages/admin/CategoriesManagement.tsx";
import BlogManagement from "./pages/admin/BlogManagement.tsx";
import BlogEditor from "./pages/admin/BlogEditor.tsx";
import QuotesManagement from "./pages/admin/QuotesManagement.tsx";
import ServicesManagement from "./pages/admin/ServicesManagement.tsx";
import SettingsManagement from "./pages/admin/SettingsManagement.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <CartProvider>
            <CartDrawer />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/boutique" element={<Shop />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/merci" element={<OrderSuccess />} />
              <Route path="/produit/:slug" element={<ProductDetail />} />
              <Route path="/devis" element={<QuoteRequest />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Admin Secure Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'editor', 'seo', 'stock_manager']} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="categories" element={<CategoriesManagement />} />
                  <Route path="orders" element={<OrdersManagement />} />
                  <Route path="customers" element={<CustomersManagement />} />
                  <Route path="promotions" element={<PromotionsManagement />} />
                  {/* Admin-only: system settings & user management */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="settings" element={<SettingsManagement />} />
                    <Route path="team" element={<UsersManagement />} />
                  </Route>
                  <Route path="blog" element={<BlogManagement />} />
                  <Route path="blog/new" element={<BlogEditor />} />
                  <Route path="blog/edit/:id" element={<BlogEditor />} />
                  <Route path="quotes" element={<QuotesManagement />} />
                  <Route path="services" element={<ServicesManagement />} />
                  <Route path="*" element={<Dashboard />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
