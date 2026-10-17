import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SmartImage } from '../components/SmartImage';
import { money, shippingFor, useCart, useSettings } from '../lib/db';

export function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const settings = useSettings();
  const shipping = shippingFor(subtotal, settings);
  return <section className="page-shell section-block cart-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Your bag</span></div>
    <div className="page-title-row"><div><span className="eyebrow">SHOPPING BAG</span><h1>Your bag<span className="title-count">{itemCount.toString().padStart(2, '0')}</span></h1><p>Review your items before checking out.</p></div><Link to="/shop" className="text-link"><ArrowLeft size={15} /> Continue shopping</Link></div>
    {!items.length ? <div className="cart-empty"><div className="cart-empty-icon"><ShoppingBag size={27} /></div><h2>Your bag is empty.</h2><p>Browse the collection and add items to your bag.</p><Link to="/shop" className="button button-primary">Shop the collection <ArrowRight size={16} /></Link></div> : <div className="cart-layout">
      <div className="cart-lines">
        <div className="cart-lines-head"><span>ITEM</span><span>PRICE</span><span>QUANTITY</span><span>TOTAL</span></div>
        {items.map(({ product, quantity }) => <article className="cart-line" key={product.id}>
          <Link to={`/products/${product.slug}`} className="cart-line-image"><SmartImage src={product.image} fallback={product.imageFallback} alt={product.name} /></Link>
          <div className="cart-line-info"><span className="product-category">{product.brand} · {product.category}</span><Link to={`/products/${product.slug}`} className="cart-line-name">{product.name}</Link><span className="cart-stock">{product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}</span><button className="remove-line" onClick={() => removeItem(product.id)}><Trash2 size={14} /> Remove</button></div>
          <div className="cart-line-price">{money(product.price)}</div>
          <div className="cart-line-quantity"><button aria-label={`Decrease ${product.name} quantity`} onClick={() => updateQuantity(product.id, quantity - 1)}><Minus size={13} /></button><span>{quantity}</span><button aria-label={`Increase ${product.name} quantity`} disabled={quantity >= Math.min(product.stock, 10)} onClick={() => updateQuantity(product.id, quantity + 1)}><Plus size={13} /></button></div>
          <strong className="cart-line-total">{money(product.price * quantity)}</strong>
        </article>)}
        <div className="cart-back-shop"><Link to="/shop"><ArrowLeft size={15} /> Continue shopping</Link><span>All prices are in Kenyan Shillings</span></div>
      </div>
      <aside className="order-summary">
        <span className="eyebrow">ORDER SUMMARY</span><h2>Summary</h2>
        <div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
        <div className="summary-row"><span>Delivery</span><strong>{shipping === 0 ? 'Free' : money(shipping)}</strong></div>
        {subtotal > 0 && subtotal < settings.freeShippingThreshold && <div className="shipping-nudge"><span className="shipping-progress"><i style={{ width: `${Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)}%` }} /></span><p>Add {money(settings.freeShippingThreshold - subtotal)} more for free delivery.</p></div>}
        <div className="summary-total"><span>Total</span><strong>{money(subtotal + shipping)}</strong></div>
        <p className="summary-note">You pay when your order is delivered, with cash or M-Pesa.</p>
        <Link to="/checkout" className="button button-primary checkout-button">Proceed to checkout <ArrowRight size={17} /></Link>
      </aside>
    </div>}
  </section>;
}
