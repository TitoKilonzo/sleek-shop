import { ArrowLeft, ArrowUpRight, Check, Minus, Plus, ShieldCheck, Star, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getProduct } from '../lib/api';
import type { Product } from '../lib/types';

export function ProductPage() {
  const { slug = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setProduct(null);
    getProduct(slug).then((value) => { if (active) setProduct(value); }).catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load this product.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);
  if (loading) return <div className="page-shell section-block"><div className="product-detail-skeleton" /></div>;
  if (!product) return <div className="page-shell section-block empty-state"><h2>We couldn't find that piece.</h2><p>{error || 'It may have moved or sold out.'}</p><Link className="button button-primary" to="/shop">Back to the collection</Link></div>;
  const add = () => { addItem(product, quantity); showToast(`${product.name} added to your bag`); };
  return <section className="page-shell product-detail-page section-block"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/shop">Shop</Link><span>/</span><span>{product.name}</span></div><Link to="/shop" className="back-link"><ArrowLeft size={15} /> Back to the collection</Link><div className="product-detail-grid"><div className="product-detail-image"><img src={product.imageUrl} alt={product.name} /><span className="image-caption">SLEEK SHOP · CURATED EVERYDAY</span></div><div className="product-detail-copy"><span className="eyebrow">{product.brand} / {product.category}</span><h1>{product.name}</h1><div className="detail-rating"><span><Star size={15} fill="currentColor" /> {product.rating.toFixed(1)}</span><span>{product.reviewCount} reviews</span><span className="rating-separator" />{product.stock > 0 ? <span className="stock-in">In stock</span> : <span className="stock-out">Out of stock</span>}</div><div className="detail-price"><strong>KES {product.price.toLocaleString('en-KE')}</strong>{product.compareAtPrice && <span>KES {product.compareAtPrice.toLocaleString('en-KE')}</span>}{product.compareAtPrice && <em>{Math.round((1 - product.price / product.compareAtPrice) * 100)}% off</em>}</div><p className="detail-description">{product.description}</p><div className="detail-rule" /><div className="quantity-control"><span>Quantity</span><div><button aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={14} /></button><span>{quantity}</span><button aria-label="Increase quantity" disabled={quantity >= Math.min(10, product.stock)} onClick={() => setQuantity((value) => Math.min(10, product.stock, value + 1))}><Plus size={14} /></button></div><small>{product.stock} available</small></div><button className="button button-primary detail-add" onClick={add} disabled={product.stock < 1}><span>Add to bag — KES {(product.price * quantity).toLocaleString('en-KE')}</span><ArrowUpRight size={18} /></button><Link to="/cart" className="detail-cart-link">View your bag <ArrowUpRight size={14} /></Link><div className="product-assurance"><div><Truck size={19} /><span><strong>Delivery, made clear</strong><small>Delivery details confirmed at checkout.</small></span></div><div><ShieldCheck size={19} /><span><strong>Support after checkout</strong><small>We're building a smoother end-to-end experience.</small></span></div><div><Check size={19} /><span><strong>Thoughtful product details</strong><small>Questions? Contact support before ordering.</small></span></div></div></div></div></section>;
}
