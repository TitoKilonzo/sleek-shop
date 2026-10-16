import { ArrowRight, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { getProducts } from '../lib/api';
import type { Product } from '../lib/types';

export function WishlistPage() {
  const { ids } = useWishlist();
  const [catalogue, setCatalogue] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getProducts({ limit: 48 }).then((products) => { if (active) setCatalogue(products); }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const savedProducts = catalogue.filter((product) => ids.includes(product.id));
  return <section className="page-shell section-block saved-page"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Saved items</span></div><div className="page-title-row"><div><span className="eyebrow">KEEP THE GOOD FINDS CLOSE</span><h1>Your saved edit <span className="title-count">{ids.length.toString().padStart(2, '0')}</span></h1><p>Pieces you liked, gathered in one place.</p></div><Link to="/shop" className="text-link">Explore more <ArrowRight size={16} /></Link></div>{loading ? <div className="product-grid">{Array.from({ length: 4 }).map((_, index) => <div className="product-skeleton" key={index}><div /><span /><span /></div>)}</div> : error ? <div className="empty-state"><h3>Your saved edit didn't load.</h3><p>Check your connection and try again.</p><button className="button button-secondary" onClick={() => window.location.reload()}>Try again</button></div> : savedProducts.length ? <div className="product-grid">{savedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="cart-empty"><div className="cart-empty-icon"><Heart size={26} /></div><h2>Keep a little room for favourites.</h2><p>Tap the heart on anything you love and it will be waiting here.</p><Link to="/shop" className="button button-primary">Find your favourites <ArrowRight size={16} /></Link></div>}</section>;
}
