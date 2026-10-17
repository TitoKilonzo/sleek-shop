import { ArrowLeft, ArrowRight, Banknote, CheckCircle2, LockKeyhole, ShoppingBag, Smartphone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SmartImage } from '../components/SmartImage';
import { useToast } from '../context/ToastContext';
import { money, placeOrder, shippingFor, useAuth, useCart, useSettings } from '../lib/db';
import { PAYMENT_METHODS, type PaymentMethod } from '@sleek/shared';

export function CheckoutPage() {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const settings = useSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentMethod>('Cash on delivery');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const shipping = shippingFor(subtotal, settings);
  const total = subtotal + shipping;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '').trim();
    setBusy(true);
    const result = await placeOrder({ customerName: text('customerName'), email: text('email'), phone: text('phone'), address: text('address'), city: text('city'), notes: text('notes') || undefined, payment }, items.map(({ product, quantity }) => ({ productId: product.id, quantity })));
    setBusy(false);
    if (!result.ok) { setError(result.error); showToast('Your order could not be placed.'); return; }
    clearCart();
    navigate(`/order-confirmation/${result.order.id}`);
  }

  if (!items.length) return <section className="page-shell section-block cart-empty"><div className="cart-empty-icon"><ShoppingBag size={26} /></div><h2>Your bag is empty.</h2><p>Add products to your bag before checking out.</p><Link to="/shop" className="button button-primary">Shop the collection <ArrowRight size={16} /></Link></section>;

  const icons: Record<PaymentMethod, JSX.Element> = { 'Cash on delivery': <Banknote size={20} />, 'M-Pesa on delivery': <Smartphone size={20} /> };
  const notes: Record<PaymentMethod, string> = { 'Cash on delivery': 'Pay the rider in cash when your order arrives.', 'M-Pesa on delivery': 'Pay by M-Pesa when your order arrives. The rider will share the payment details.' };

  return <section className="page-shell section-block checkout-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Your bag</Link><span>/</span><span>Checkout</span></div>
    <Link to="/cart" className="back-link"><ArrowLeft size={15} /> Return to your bag</Link>
    <div className="checkout-heading"><span className="eyebrow">CHECKOUT</span><h1>Delivery <em>details.</em></h1><p>Tell us where to deliver your order. We will contact you to confirm.</p></div>
    {!user && <p className="checkout-signin">Have an account? <Link to="/login" state={{ from: '/checkout' }}>Sign in</Link> to fill in your details and track this order.</p>}
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={onSubmit}>
        <section className="checkout-form-section"><div className="form-section-title"><span>01</span><div><h2>Contact details</h2><p>So we can keep you updated.</p></div></div><div className="form-grid">
          <label className="field field-full"><span>Full name *</span><input name="customerName" autoComplete="name" required minLength={2} maxLength={100} defaultValue={user?.name ?? ''} placeholder="Your full name" /></label>
          <label className="field"><span>Email address *</span><input name="email" type="email" autoComplete="email" required defaultValue={user?.email ?? ''} placeholder="you@example.com" /></label>
          <label className="field"><span>Phone number *</span><input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={24} defaultValue={user?.phone ?? ''} placeholder="+254 7XX XXX XXX" /></label>
        </div></section>
        <section className="checkout-form-section"><div className="form-section-title"><span>02</span><div><h2>Delivery address</h2><p>Where should we deliver?</p></div></div><div className="form-grid">
          <label className="field field-full"><span>Street, building or estate *</span><input name="address" autoComplete="street-address" required minLength={5} maxLength={250} defaultValue={user?.address ?? ''} placeholder="Building, street, estate or landmark" /></label>
          <label className="field"><span>Town or city *</span><input name="city" autoComplete="address-level2" required minLength={2} maxLength={80} defaultValue={user?.city ?? ''} placeholder="Nairobi" /></label>
          <label className="field"><span>Delivery notes <small>Optional</small></span><input name="notes" maxLength={500} placeholder="Landmark or directions" /></label>
        </div></section>
        <section className="checkout-form-section"><div className="form-section-title"><span>03</span><div><h2>Payment method</h2><p>You pay when your order arrives.</p></div></div>
          {PAYMENT_METHODS.map((method) => <label key={method} className={`payment-option ${payment === method ? 'is-selected' : ''}`}><input type="radio" name="payment" checked={payment === method} onChange={() => setPayment(method)} /><span className="payment-option-icon">{icons[method]}</span><span className="payment-option-copy"><strong>{method === 'Cash on delivery' ? 'Cash on delivery' : 'M-Pesa on delivery'}</strong><small>{notes[method]}</small></span>{payment === method && <CheckCircle2 size={19} className="payment-check" />}</label>)}
          <p className="payment-disclaimer">No payment is taken online. Your order is confirmed by our team before dispatch.</p>
        </section>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="button button-primary place-order-button" disabled={busy}><span>{busy ? 'Placing your order' : `Place order · ${money(total)}`}</span><ArrowRight size={17} /></button>
        <div className="form-privacy"><LockKeyhole size={14} /> Your details are used only to process your order.</div>
      </form>
      <aside className="checkout-summary">
        <span className="eyebrow">YOUR ORDER</span><h2>Summary <span>{itemCount}</span></h2>
        <div className="checkout-mini-lines">{items.map(({ product, quantity }) => <div className="checkout-mini-line" key={product.id}><div className="mini-product-img"><SmartImage src={product.image} fallback={product.imageFallback} alt={product.name} /><b>{quantity}</b></div><div><strong>{product.name}</strong><small>{product.brand}</small></div><span>{money(product.price * quantity)}</span></div>)}</div>
        <div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
        <div className="summary-row"><span>Delivery</span><strong>{shipping === 0 ? 'Free' : money(shipping)}</strong></div>
        <div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div>
        <div className="summary-support"><CheckCircle2 size={17} /><p><strong>No hidden charges.</strong><br />The total shown is what you pay on delivery.</p></div>
      </aside>
    </div>
  </section>;
}
