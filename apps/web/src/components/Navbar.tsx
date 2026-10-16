import { ChevronDown, Heart, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

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
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const search = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
    setMobileOpen(false);
  };
  return <>
    <div className="announcement"><span>THE SLEEK EDIT</span><i /> Thoughtful finds, made for every day <i /><span className="announcement-right">Enjoy free delivery on orders over KES 7,500</span></div>
    <header className="site-header">
      <div className="header-main page-shell">
        <button className="mobile-menu icon-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
        <Link to="/" className="brand-lockup" aria-label="Sleek Shop home"><span className="brand-mark">s.</span><span className="brand-word">sleek<span>shop</span><small>CURATED EVERYDAY</small></span></Link>
        <form className="header-search" onSubmit={search} role="search"><Search size={17} /><input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for something lovely..." /><span className="search-shortcut">ENTER ↵</span></form>
        <div className="header-actions"><Link to="/saved" className="header-action saved-action" aria-label={`Saved items, ${wishlist.count} items`}><span className="bag-icon"><Heart size={20} />{wishlist.count > 0 && <b>{wishlist.count > 99 ? '99+' : wishlist.count}</b>}</span><span>Saved</span></Link><button className="header-action account-action" onClick={() => showToast('Customer accounts are coming in the next release.')}><UserRound size={19} /><span>Account</span></button><Link to="/cart" className="header-action bag-action"><span className="bag-icon"><ShoppingBag size={20} />{itemCount > 0 && <b>{itemCount > 99 ? '99+' : itemCount}</b>}</span><span>Bag</span></Link></div>
      </div>
      <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation"><div className="page-shell nav-inner"><div className="nav-links">{navItems.map((item) => <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} className="nav-link">{item.label}</Link>)}</div><Link to="/shop" className="nav-discover">Discover the edit <ChevronDown size={14} /></Link></div></nav>
    </header>
  </>;
}
