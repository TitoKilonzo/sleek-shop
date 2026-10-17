import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/Console';
import { SmartImage } from '../../components/SmartImage';
import { formatDateTime } from '../../lib/format';
import { money } from '../../lib/db';
import { useMyOrders } from './AccountOverview';

const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'] as const;

export function AccountOrders() {
  const orders = useMyOrders();
  const [openId, setOpenId] = useState<string | null>(null);
  return <>
    <PageHeader title="My orders" subtitle="Track and review everything you have ordered." />
    {!orders.length ? <section className="panel"><div className="panel-empty"><p>You have not placed any orders yet.</p><Link to="/shop" className="button button-secondary button-sm">Start shopping</Link></div></section> : <div className="order-cards">{orders.map((order) => {
      const open = openId === order.id;
      const stage = steps.indexOf(order.status as (typeof steps)[number]);
      return <article className="panel order-card" key={order.id}>
        <button className="order-card-head" onClick={() => setOpenId(open ? null : order.id)} aria-expanded={open}>
          <span><strong>{order.id}</strong><small>{formatDateTime(order.createdAt)}</small></span>
          <span className="order-card-meta"><StatusBadge status={order.status} /><strong>{money(order.total)}</strong><ChevronDown size={18} className={open ? 'is-flipped' : ''} /></span>
        </button>
        {open && <div className="order-card-body">
          {order.status !== 'Cancelled' ? <ol className="tracker">{steps.map((step, index) => <li key={step} className={index <= stage ? 'is-done' : ''}><span />{step}</li>)}</ol> : <p className="order-cancelled">This order was cancelled.</p>}
          <div className="order-lines">{order.items.map((item) => <div className="order-line" key={item.productId}><SmartImage src={item.image} fallback={item.imageFallback} alt={item.name} /><div><strong>{item.name}</strong><small>Quantity {item.quantity}</small></div><span>{money(item.price * item.quantity)}</span></div>)}</div>
          <div className="order-totals"><div><span>Subtotal</span><strong>{money(order.subtotal)}</strong></div><div><span>Delivery</span><strong>{order.shipping === 0 ? 'Free' : money(order.shipping)}</strong></div><div className="order-totals-final"><span>Total</span><strong>{money(order.total)}</strong></div></div>
          <p className="order-address"><strong>Delivery to</strong> {order.address}, {order.city}. <strong>Payment</strong> {order.payment}.</p>
        </div>}
      </article>;
    })}</div>}
  </>;
}
