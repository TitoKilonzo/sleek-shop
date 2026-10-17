import { ArrowRight, Heart, Package, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/Console';
import { formatDate } from '../../lib/format';
import { money, useAuth, useOrders, useWishlist } from '../../lib/db';

export function useMyOrders() {
  const { user } = useAuth();
  const orders = useOrders();
  return orders.filter((order) => user && (order.userId === user.id || (!order.userId && order.email.toLowerCase() === user.email.toLowerCase())));
}

export function AccountOverview() {
  const { user } = useAuth();
  const orders = useMyOrders();
  const wishlist = useWishlist();
  if (!user) return null;
  const spent = orders.filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + order.total, 0);
  const open = orders.filter((order) => order.status === 'Pending' || order.status === 'Processing' || order.status === 'Shipped').length;
  return <>
    <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Here is a summary of your account and recent activity." actions={<Link to="/shop" className="button button-primary button-sm">Continue shopping <ArrowRight size={15} /></Link>} />
    <div className="stat-grid">
      <div className="stat-card"><span className="stat-icon"><Package size={20} /></span><div><small>Total orders</small><strong>{orders.length}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><Package size={20} /></span><div><small>Orders in progress</small><strong>{open}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><Wallet size={20} /></span><div><small>Total spent</small><strong>{money(spent)}</strong></div></div>
      <div className="stat-card"><span className="stat-icon"><Heart size={20} /></span><div><small>Saved items</small><strong>{wishlist.count}</strong></div></div>
    </div>
    <section className="panel">
      <div className="panel-head"><h2>Recent orders</h2><Link to="/account/orders" className="text-link">View all <ArrowRight size={15} /></Link></div>
      {orders.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.slice(0, 5).map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{formatDate(order.createdAt)}</td><td>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td>{money(order.total)}</td><td><StatusBadge status={order.status} /></td></tr>)}</tbody></table></div> : <div className="panel-empty"><p>You have not placed any orders yet.</p><Link to="/shop" className="button button-secondary button-sm">Start shopping</Link></div>}
    </section>
  </>;
}
