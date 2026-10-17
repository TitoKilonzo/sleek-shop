import { ArrowUpRight, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { money, useCart, useWishlist } from '../lib/db';
import { useToast } from '../context/ToastContext';
import type { Product } from '@sleek/shared';
import { SmartImage } from './SmartImage';

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { isSaved, toggleSaved } = useWishlist();
  const saved = isSaved(product.id);
  const soldOut = product.stock < 1;
  const save = () => showToast(toggleSaved(product.id) ? `${product.name} saved for later` : 'Removed from your saved items');
  const add = () => { addItem(product); showToast(`${product.name} added to your bag`); };
  return <article className={`product-card ${compact ? 'product-card-compact' : ''}`}>
    <div className="product-image-wrap">
      <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="product-image-link">
        <SmartImage className="product-image" src={product.image} fallback={product.imageFallback} alt={product.name} loading="lazy" />
      </Link>
      {(soldOut || product.badge) && <span className="product-badge">{soldOut ? 'Sold out' : product.badge}</span>}
      <button className={`icon-button product-heart ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name} for later`} aria-pressed={saved} onClick={save}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
      <button className="quick-add" onClick={add} disabled={soldOut}><span>{soldOut ? 'Sold out' : 'Add to bag'}</span><ArrowUpRight size={15} /></button>
    </div>
    <div className="product-meta">
      <div className="product-category">{product.brand} <span>·</span> {product.category}</div>
      <Link to={`/products/${product.slug}`} className="product-name">{product.name}</Link>
      <div className="product-bottom"><div className="price-line"><span className="price">{money(product.price)}</span>{product.compareAtPrice && <span className="old-price">{money(product.compareAtPrice)}</span>}</div><span className="rating"><Star size={13} fill="currentColor" /> {product.rating.toFixed(1)} <span className="review-count">({product.reviewCount})</span></span></div>
    </div>
  </article>;
}
