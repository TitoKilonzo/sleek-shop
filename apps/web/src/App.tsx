import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { ProductPage } from './pages/ProductPage';
import { ShopPage } from './pages/ShopPage';
import { WishlistPage } from './pages/WishlistPage';

export default function App() {
  return <BrowserRouter><CartProvider><WishlistProvider><ToastProvider><Routes><Route element={<Layout />}><Route index element={<HomePage />} /><Route path="shop" element={<ShopPage />} /><Route path="products/:slug" element={<ProductPage />} /><Route path="cart" element={<CartPage />} /><Route path="saved" element={<WishlistPage />} /><Route path="checkout" element={<CheckoutPage />} /><Route path="order-confirmation" element={<OrderConfirmationPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></ToastProvider></WishlistProvider></CartProvider></BrowserRouter>;
}
