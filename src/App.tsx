import { BarChart3, Boxes, LayoutDashboard, MessageSquare, Package, Settings as SettingsIcon, ShoppingCart, UserRound, Users, Heart } from 'lucide-react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ConsoleShell, type ConsoleNavItem } from './components/Console';
import { Boot } from './components/Boot';
import { InstallPrompt } from './components/InstallPrompt';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';
import { ToastProvider } from './context/ToastContext';
import { useAuth, useMessages, useOrders } from './lib/db';
import { AccountOrders } from './pages/account/AccountOrders';
import { AccountOverview } from './pages/account/AccountOverview';
import { AccountProfile } from './pages/account/AccountProfile';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminSettings } from './pages/admin/AdminSettings';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { InfoPage } from './pages/InfoPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ProductPage } from './pages/ProductPage';
import { RegisterPage } from './pages/RegisterPage';
import { ShopPage } from './pages/ShopPage';
import { WishlistPage } from './pages/WishlistPage';

function AdminShell() {
  const { isAdmin } = useAuth();
  const pending = useOrders().filter((order) => order.status === 'Pending').length;
  const unread = useMessages().filter((message) => !message.read).length;
  const nav: ConsoleNavItem[] = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart, badge: pending },
    { to: '/admin/products', label: 'Products', icon: Boxes },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/messages', label: 'Messages', icon: MessageSquare, badge: unread },
    ...(isAdmin ? [{ to: '/admin/settings', label: 'Settings', icon: SettingsIcon }] : []),
  ];
  return <ConsoleShell title="Admin console" nav={nav} variant="admin" />;
}

const accountNav: ConsoleNavItem[] = [
  { to: '/account', label: 'Overview', icon: BarChart3, end: true },
  { to: '/account/orders', label: 'My orders', icon: Package },
  { to: '/account/profile', label: 'Profile', icon: UserRound },
  { to: '/saved', label: 'Saved items', icon: Heart },
];

export default function App() {
  return <BrowserRouter><ToastProvider><Boot>
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="admin" element={<RequireAuth staffOnly><AdminShell /></RequireAuth>}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<RequireAuth adminOnly><AdminSettings /></RequireAuth>} />
      </Route>
      <Route path="account" element={<RequireAuth><ConsoleShell title="My account" nav={accountNav} variant="account" /></RequireAuth>}>
        <Route index element={<AccountOverview />} />
        <Route path="orders" element={<AccountOrders />} />
        <Route path="profile" element={<AccountProfile />} />
      </Route>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="products/:slug" element={<ProductPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="saved" element={<WishlistPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="order-confirmation/:id" element={<OrderConfirmationPage />} />
        <Route path="help/:topic" element={<InfoPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </Boot>
    <InstallPrompt />
  </ToastProvider></BrowserRouter>;
}
