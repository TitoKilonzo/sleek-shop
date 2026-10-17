import { ArrowLeft, ArrowUpRight, Check, Minus, Plus, RefreshCcw, Star, Truck, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SmartImage } from '../components/SmartImage';
import { useToast } from '../context/ToastContext';
import { money, queryProducts, useCart, useProducts, useSettings } from '../lib/db';

export function ProductPage() {
  const { slug = '' } = useParams();
  const products = useProducts();
  const settings = useSettings();
  const product = products.find((item) => item.slug === slug && item.active);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();
  useEffect(() => setQuantity(1), [slug]);

  if (!product) return <div className="page-shell section-block empty-state"><h2>Product not found.</h2><p>It may have been removed or is no longer available.</p><Link className="button button-primary" to="/shop">Back to the shop</Link></div>;

  const maxQuantity = Math.max(1, Math.min(10, product.stock));
  const related = queryProducts(products, { category: product.category }).filter((item) => item.id !== product.id).slice(0, 4);
  const add = () => { addItem(product, quantity); showToast(`${product.name} added to your bag`); };
  return <section className="page-shell product-detail-page section-block">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/shop">Shop</Link><span>/</span><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div>
    <Link to="/shop" className="back-link"><ArrowLeft size={15} /> Back to the shop</Link>
    <div className="product-detail-grid">
      <div className="product-detail-image"><SmartImage src={product.image} fallback={product.imageFallback} alt={product.name} /></div>
      <div className="product-detail-copy">
        <span className="eyebrow">{product.brand} / {product.category}</span>
        <h1>{product.name}</h1>
        <div className="detail-rating"><span><Star size={15} fill="currentColor" /> {product.rating.toFixed(1)}</span><span>{product.reviewCount} reviews</span><span className="rating-separator" />{product.stock > 0 ? <span className="stock-in">In stock</span> : <span className="stock-out">Out of stock</span>}</div>
        <div className="detail-price"><strong>{money(product.price)}</strong>{product.compareAtPrice && <span>{money(product.compareAtPrice)}</span>}{product.compareAtPrice && <em>{Math.round((1 - product.price / product.compareAtPrice) * 100)}% off</em>}</div>
        <p className="detail-description">{product.description}</p>
        <div className="detail-rule" />
        <div className="quantity-control"><span>Quantity</span><div><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= maxQuantity} onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}><Plus size={14} /></button></div><small>{product.stock} available</small></div>
        <button className="button button-primary detail-add" onClick={add} disabled={product.stock < 1}><span>{product.stock < 1 ? 'Out of stock' : `Add to bag  ·  ${money(product.price * quantity)}`}</span><ArrowUpRight size={18} /></button>
        <Link to="/cart" className="detail-cart-link">View your bag <ArrowUpRight size={14} /></Link>
        <div className="product-assurance">
          <div><Truck size={19} /><span><strong>Delivery across Kenya</strong><small>{money(settings.shippingFee)} delivery, free over {money(settings.freeShippingThreshold)}.</small></span></div>
          <div><Wallet size={19} /><span><strong>Pay on delivery</strong><small>Pay with cash or M-Pesa when your order arrives.</small></span></div>
          <div><RefreshCcw size={19} /><span><strong>7 day exchanges</strong><small>Unused items can be exchanged within 7 days.</small></span></div>
          <div><Check size={19} /><span><strong>SKU {product.sku}</strong><small>Quote this code when contacting support.</small></span></div>
        </div>
      </div>
    </div>
    {related.length > 0 && <div className="related-block"><div className="section-heading"><div><span className="eyebrow">YOU MAY ALSO LIKE</span><h2>More in <em>{product.category}.</em></h2></div></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div>}
  </section>;
}
