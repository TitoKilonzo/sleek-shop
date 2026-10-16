import { ArrowRight, Check, PackageCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function OrderConfirmationPage() {
  const location = useLocation();
  const order = (location.state as { order?: { orderId: string; total: number; status: string; message: string } } | null)?.order;
  return <section className="page-shell section-block confirmation-page"><div className="confirmation-card"><div className="confirmation-check"><Check size={32} /></div><span className="eyebrow">THANK YOU FOR CHOOSING SLEEK</span><h1>Your order is <em>in good hands.</em></h1><p>{order?.message ?? 'Thanks for shopping with Sleek Shop. If you just refreshed the page, check your order confirmation details in the previous screen.'}</p>{order && <div className="confirmation-reference"><span>ORDER REFERENCE</span><strong>{order.orderId}</strong><span>Order total <b>KES {order.total.toLocaleString('en-KE')}</b></span><span className="confirmation-status"><PackageCheck size={16} /> Awaiting confirmation</span></div>}<p className="confirmation-note">This starter records orders using cash on delivery. Our online payments and customer order history will be connected in a later release.</p><div className="confirmation-actions"><Link to="/shop" className="button button-primary">Keep exploring <ArrowRight size={16} /></Link><Link to="/" className="text-link">Back to home</Link></div></div></section>;
}
