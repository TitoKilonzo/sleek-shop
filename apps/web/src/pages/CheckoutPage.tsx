import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, PackageCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { submitOrder } from '../lib/api';

const FREE_SHIPPING_THRESHOLD = 7500;
const SHIPPING_FEE = 350;
const money = (value: number) => `KES ${value.toLocaleString('en-KE')}`;

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    setSubmitting(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const order = await submitOrder({
        customerName: String(form.get('customerName') ?? '').trim(),
        email: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
        address: String(form.get('address') ?? '').trim(),
        city: String(form.get('city') ?? '').trim(),
        notes: String(form.get('notes') ?? '').trim() || undefined,
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
      });
      clearCart();
      navigate('/order-confirmation', { state: { order } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not submit the order. Please try again.');
      showToast('Please review your details and try again.');
    } finally { setSubmitting(false); }
  }

  if (!items.length) return <section className="page-shell section-block cart-empty"><div className="cart-empty-icon"><PackageCheck size={26} /></div><h2>Your bag is empty.</h2><p>Add a few things before heading to checkout.</p><Link to="/shop" className="button button-primary">Explore the collection <ArrowRight size={16} /></Link></section>;

  return <section className="page-shell section-block checkout-page"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Your bag</Link><span>/</span><span>Checkout</span></div><Link to="/cart" className="back-link"><ArrowLeft size={15} /> Return to your bag</Link><div className="checkout-heading"><span className="eyebrow">JUST A FEW DETAILS</span><h1>Make it <em>yours.</em></h1><p>Tell us where your order should go. We’ll confirm the delivery details with you.</p></div><div className="checkout-layout"><form className="checkout-form" onSubmit={onSubmit}><section className="checkout-form-section"><div className="form-section-title"><span>01</span><div><h2>Contact details</h2><p>So we can keep you updated.</p></div></div><div className="form-grid"><label className="field field-full"><span>Full name *</span><input name="customerName" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your full name" /></label><label className="field"><span>Email address *</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label><label className="field"><span>Phone number *</span><input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={24} placeholder="+254 7XX XXX XXX" /></label></div></section><section className="checkout-form-section"><div className="form-section-title"><span>02</span><div><h2>Delivery address</h2><p>Where should we bring your finds?</p></div></div><div className="form-grid"><label className="field field-full"><span>Street, building or estate *</span><input name="address" autoComplete="street-address" required minLength={5} maxLength={250} placeholder="Building, street, estate or landmark" /></label><label className="field"><span>Town / city *</span><input name="city" autoComplete="address-level2" required minLength={2} maxLength={80} placeholder="Nairobi" /></label><label className="field"><span>Delivery notes <small>Optional</small></span><input name="notes" maxLength={500} placeholder="Landmark or helpful directions" /></label></div></section><section className="checkout-form-section"><div className="form-section-title"><span>03</span><div><h2>Payment method</h2><p>Choose a simple, familiar way to pay.</p></div></div><label className="payment-option"><input type="radio" checked readOnly /><span className="payment-option-icon"><PackageCheck size={20} /></span><span className="payment-option-copy"><strong>Cash on delivery</strong><small>Place the order now; our team will contact you to confirm delivery and payment arrangements.</small></span><CheckCircle2 size={19} className="payment-check" /></label><p className="payment-disclaimer">Online card and M-Pesa payments are not connected in this starter yet. No payment will be taken on this screen.</p></section>{error && <div className="form-error" role="alert">{error}</div>}<button type="submit" className="button button-primary place-order-button" disabled={submitting}>{submitting ? 'Placing your order…' : 'Place order — ' + money(total)}{!submitting && <ArrowRight size={17} />}</button><div className="form-privacy"><LockKeyhole size={14} /> Your details are sent securely to the Sleek Shop API.</div></form><aside className="checkout-summary"><span className="eyebrow">YOUR SELECTION</span><h2>Order summary <span>{items.reduce((sum, line) => sum + line.quantity, 0)}</span></h2><div className="checkout-mini-lines">{items.map(({ product, quantity }) => <div className="checkout-mini-line" key={product.id}><div className="mini-product-img"><img src={product.imageUrl} alt={product.name} /><b>{quantity}</b></div><div><strong>{product.name}</strong><small>{product.brand}</small></div><span>{money(product.price * quantity)}</span></div>)}</div><div className="summary-row"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="summary-row"><span>Delivery</span><strong>{shipping === 0 ? 'Free' : money(shipping)}</strong></div><div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><div className="summary-support"><CheckCircle2 size={17} /><p><strong>No surprises.</strong><br />Your order total and delivery arrangement are shown before you place the order.</p></div></aside></div></section>;
}
