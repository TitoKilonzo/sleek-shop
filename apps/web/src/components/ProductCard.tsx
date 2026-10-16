import { ArrowUpRight, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import type { Product } from '../lib/types';

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { isSaved, toggleSaved } = useWishlist();
  const saved = isSaved(product.id);
  const save = () => { const nowSaved = toggleSaved(product); showToast(nowSaved ? `${product.name} saved for later` : 'Removed from your saved items'); };
  const add = () => { addItem(product); showToast(`${product.name} added to your bag`); };
  return <article className={`product-card ${compact ? 'product-card-compact' : ''}`}>
    <div className="product-image-wrap">
      <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="product-image-link">
        <img className="product-image" src={product.imageUrl} alt={product.name} loading="lazy" />
      </Link>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <button className={`icon-button product-heart ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name} for later`} aria-pressed={saved} onClick={save}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
      <button className="quick-add" onClick={add}><span>Add to bag</span><ArrowUpRight size={15} /></button>
    </div>
    <div className="product-meta">
      <div className="product-category">{product.brand} <span>·</span> {product.category}</div>
      <Link to={`/products/${product.slug}`} className="product-name">{product.name}</Link>
      <div className="product-bottom"><div className="price-line"><span className="price">KES {product.price.toLocaleString('en-KE')}</span>{product.compareAtPrice && <span className="old-price">KES {product.compareAtPrice.toLocaleString('en-KE')}</span>}</div><span className="rating"><Star size={13} fill="currentColor" /> {product.rating.toFixed(1)} <span className="review-count">({product.reviewCount})</span></span></div>
    </div>
  </article>;
}
