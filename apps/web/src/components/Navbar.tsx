import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart, useSettings, useWishlist } from '../lib/db';
import { UserMenu } from './UserMenu';

const navItems = [
  { label: 'New in', to: '/shop?sort=featured' },
  { label: 'Bags', to: '/shop?category=Bags' },
  { label: 'Footwear', to: '/shop?category=Footwear' },
  { label: 'Tech', to: '/shop?category=Tech' },
  { label: 'Laptops', to: '/shop?category=Laptops' },
  { label: 'Accessories', to: '/shop?category=Accessories' },
];

export function Navbar() {
  const { itemCount } = useCart();
  const wishlist = useWishlist();
  const settings = useSettings();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
    setMobileOpen(false);
  };
  const active = (to: string) => `${location.pathname}${location.search}` === to;
  return <>
    <div className="announcement"><span>{settings.storeName.toUpperCase()}</span><span className="announcement-mid">Style, technology and everyday essentials</span><span className="announcement-right">{settings.announcement}</span></div>
    <header className="site-header">
      <div className="header-main page-shell">
        <button className="mobile-menu icon-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
        <Link to="/" className="brand-lockup" aria-label={`${settings.storeName} home`}><span className="brand-mark">s.</span><span className="brand-word">sleek<span>shop</span><small>EVERYDAY ESSENTIALS</small></span></Link>
        <form className="header-search" onSubmit={search} role="search"><Search size={17} /><input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /></form>
        <div className="header-actions">
          <Link to="/saved" className="header-action saved-action" aria-label={`Saved items, ${wishlist.count}`}><span className="bag-icon"><Heart size={20} />{wishlist.count > 0 && <b>{wishlist.count > 99 ? '99+' : wishlist.count}</b>}</span><span>Saved</span></Link>
          <UserMenu />
          <Link to="/cart" className="header-action bag-action" aria-label={`Bag, ${itemCount} items`}><span className="bag-icon"><ShoppingBag size={20} />{itemCount > 0 && <b>{itemCount > 99 ? '99+' : itemCount}</b>}</span><span>Bag</span></Link>
        </div>
      </div>
      <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation"><div className="page-shell nav-inner"><div className="nav-links">{navItems.map((item) => <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} className={`nav-link ${active(item.to) ? 'is-current' : ''}`}>{item.label}</Link>)}</div><NavLink to="/shop" className="nav-discover" onClick={() => setMobileOpen(false)}>Shop all products</NavLink></div></nav>
    </header>
  </>;
}
