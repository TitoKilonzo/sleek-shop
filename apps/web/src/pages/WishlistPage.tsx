import { ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts, useWishlist } from '../lib/db';

export function WishlistPage() {
  const { ids } = useWishlist();
  const saved = useProducts().filter((product) => product.active && ids.includes(product.id));
  return <section className="page-shell section-block saved-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Saved items</span></div>
    <div className="page-title-row"><div><span className="eyebrow">WISHLIST</span><h1>Saved items <span className="title-count">{saved.length.toString().padStart(2, '0')}</span></h1><p>Products you have saved for later.</p></div><Link to="/shop" className="text-link">Browse more <ArrowRight size={16} /></Link></div>
    {saved.length ? <div className="product-grid">{saved.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="cart-empty"><div className="cart-empty-icon"><Heart size={26} /></div><h2>No saved items yet.</h2><p>Select the heart on any product to save it here.</p><Link to="/shop" className="button button-primary">Browse products <ArrowRight size={16} /></Link></div>}
  </section>;
}
