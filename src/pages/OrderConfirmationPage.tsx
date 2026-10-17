import { ArrowRight, Check, PackageCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { money, useAuth, useLastOrder, useOrders } from '../lib/db';

export function OrderConfirmationPage() {
  const { id = '' } = useParams();
  const last = useLastOrder();
  const order = useOrders().find((item) => item.id === id) ?? (last?.id === id ? last : undefined);
  const { user } = useAuth();
  return <section className="page-shell section-block confirmation-page"><div className="confirmation-card">
    <div className="confirmation-check"><Check size={32} /></div>
    <span className="eyebrow">ORDER RECEIVED</span>
    <h1>Thank you for your <em>order.</em></h1>
    {order ? <>
      <p>We have received your order and will call you on {order.phone} to confirm delivery to {order.city}.</p>
      <div className="confirmation-reference">
        <span>ORDER NUMBER</span><strong>{order.id}</strong>
        <span>Order total <b>{money(order.total)}</b></span>
        <span>Payment: {order.payment}</span>
        <span className="confirmation-status"><PackageCheck size={16} /> {order.status}</span>
      </div>
    </> : <p>We could not find this order. If you have just placed one, please check your email or contact support.</p>}
    <div className="confirmation-actions"><Link to="/shop" className="button button-primary">Continue shopping <ArrowRight size={16} /></Link>{user ? <Link to="/account/orders" className="text-link">View my orders</Link> : <Link to="/" className="text-link">Back to home</Link>}</div>
  </div></section>;
}
