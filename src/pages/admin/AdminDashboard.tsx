import { AlertTriangle, ArrowRight, Boxes, ShoppingCart, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/Console';
import { SmartImage } from '../../components/SmartImage';
import { formatDate } from '../../lib/format';
import { money, useOrders, useProducts, useSettings, useUsers } from '../../lib/db';
import { ORDER_STATUSES } from '@sleek/shared';

const DAY = 86400000;
const startOfDay = (date: Date) => { const d = new Date(date); d.setHours(0, 0, 0, 0); return d.getTime(); };

function RevenueChart({ points }: { points: Array<{ label: string; value: number; full: string }> }) {
  const width = 720, height = 240, left = 52, bottom = 30, top = 14, right = 8;
  const max = Math.max(1000, ...points.map((point) => point.value));
  const nice = Math.pow(10, Math.floor(Math.log10(max)));
  const ceiling = Math.ceil(max / nice) * nice;
  const innerW = width - left - right, innerH = height - top - bottom;
  const slot = innerW / points.length, bar = Math.min(30, slot * 0.62);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * ceiling);
  const fmt = (value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value));
  return <svg viewBox={`0 0 ${width} ${height}`} className="chart" role="img" aria-label="Revenue for the last 14 days">
    {ticks.map((tick) => { const y = top + innerH - (tick / ceiling) * innerH; return <g key={tick}><line x1={left} x2={width - right} y1={y} y2={y} className="chart-grid" /><text x={left - 8} y={y + 4} textAnchor="end" className="chart-axis">{fmt(tick)}</text></g>; })}
    {points.map((point, index) => {
      const h = (point.value / ceiling) * innerH;
      const x = left + index * slot + (slot - bar) / 2;
      return <g key={point.full}><rect x={x} y={top + innerH - h} width={bar} height={Math.max(h, point.value ? 2 : 0)} rx={3} className="chart-bar"><title>{`${point.full}: ${money(point.value)}`}</title></rect>{index % 2 === 0 && <text x={x + bar / 2} y={height - 9} textAnchor="middle" className="chart-axis">{point.label}</text>}</g>;
    })}
  </svg>;
}

export function AdminDashboard() {
  const orders = useOrders();
  const products = useProducts();
  const users = useUsers();
  const settings = useSettings();
  const valid = orders.filter((order) => order.status !== 'Cancelled');
  const revenue = valid.reduce((sum, order) => sum + order.total, 0);
  const customers = users.filter((user) => user.role === 'customer');
  const lowStock = products.filter((product) => product.stock <= settings.lowStockLevel).sort((a, b) => a.stock - b.stock);

  const today = startOfDay(new Date());
  const days = Array.from({ length: 14 }, (_, index) => today - (13 - index) * DAY);
  const points = days.map((day) => {
    const value = valid.filter((order) => startOfDay(new Date(order.createdAt)) === day).reduce((sum, order) => sum + order.total, 0);
    const date = new Date(day);
    return { label: String(date.getDate()), full: date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }), value };
  });
  const recent = points.reduce((sum, point) => sum + point.value, 0);
  const previous = valid.filter((order) => { const t = new Date(order.createdAt).getTime(); return t >= today - 27 * DAY && t < today - 13 * DAY; }).reduce((sum, order) => sum + order.total, 0);
  const change = previous > 0 ? Math.round(((recent - previous) / previous) * 100) : null;

  const units = new Map<string, { name: string; image: string; fallback?: string; qty: number; revenue: number }>();
  valid.forEach((order) => order.items.forEach((item) => {
    const row = units.get(item.productId) ?? { name: item.name, image: item.image, fallback: item.imageFallback, qty: 0, revenue: 0 };
    row.qty += item.quantity; row.revenue += item.price * item.quantity; units.set(item.productId, row);
  }));
  const top = [...units.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const statusCounts = ORDER_STATUSES.map((status) => ({ status, count: orders.filter((order) => order.status === status).length }));
  const maxCount = Math.max(1, ...statusCounts.map((row) => row.count));

  return <>
    <PageHeader title="Dashboard" subtitle="A summary of sales, orders and stock across the store." actions={<Link to="/admin/orders" className="button button-primary button-sm">Manage orders <ArrowRight size={15} /></Link>} />
    <div className="stat-grid">
      <div className="stat-card"><span className="stat-icon"><Wallet size={20} /></span><div><small>Total revenue</small><strong>{money(revenue)}</strong>{change !== null && <em className={change >= 0 ? 'trend-up' : 'trend-down'}>{change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {Math.abs(change)}% vs previous 14 days</em>}</div></div>
      <div className="stat-card"><span className="stat-icon"><ShoppingCart size={20} /></span><div><small>Total orders</small><strong>{orders.length}</strong><em>{orders.filter((order) => order.status === 'Pending').length} awaiting confirmation</em></div></div>
      <div className="stat-card"><span className="stat-icon"><Users size={20} /></span><div><small>Customers</small><strong>{customers.length}</strong><em>Registered accounts</em></div></div>
      <div className="stat-card"><span className="stat-icon"><Boxes size={20} /></span><div><small>Low stock items</small><strong>{lowStock.length}</strong><em>At or below {settings.lowStockLevel} units</em></div></div>
    </div>
    <div className="dash-grid">
      <section className="panel dash-wide"><div className="panel-head"><h2>Revenue, last 14 days</h2><span className="panel-note">{money(recent)}</span></div><RevenueChart points={points} /></section>
      <section className="panel"><div className="panel-head"><h2>Orders by status</h2></div><ul className="bar-list">{statusCounts.map((row) => <li key={row.status}><span>{row.status}</span><span className="bar-track"><i className={`status-fill status-${row.status.toLowerCase()}`} style={{ width: `${(row.count / maxCount) * 100}%` }} /></span><strong>{row.count}</strong></li>)}</ul></section>
      <section className="panel dash-wide"><div className="panel-head"><h2>Recent orders</h2><Link to="/admin/orders" className="text-link">View all <ArrowRight size={15} /></Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.slice(0, 6).map((order) => <tr key={order.id}><td><Link to={`/admin/orders?q=${order.id}`}><strong>{order.id}</strong></Link></td><td>{order.customerName}</td><td>{formatDate(order.createdAt)}</td><td>{money(order.total)}</td><td><StatusBadge status={order.status} /></td></tr>)}</tbody></table></div></section>
      <section className="panel"><div className="panel-head"><h2>Top products</h2></div><ul className="mini-list">{top.map((row) => <li key={row.name}><SmartImage src={row.image} fallback={row.fallback} alt={row.name} /><div><strong>{row.name}</strong><small>{row.qty} sold</small></div><span>{money(row.revenue)}</span></li>)}</ul></section>
      <section className="panel dash-wide"><div className="panel-head"><h2>Stock alerts</h2><Link to="/admin/products" className="text-link">Manage products <ArrowRight size={15} /></Link></div>{lowStock.length ? <ul className="alert-list">{lowStock.slice(0, 5).map((product) => <li key={product.id}><AlertTriangle size={17} className={product.stock === 0 ? 'icon-danger' : 'icon-warn'} /><span><strong>{product.name}</strong><small>{product.sku}</small></span><b className={product.stock === 0 ? 'chip chip-danger' : 'chip chip-warn'}>{product.stock === 0 ? 'Out of stock' : `${product.stock} left`}</b></li>)}</ul> : <div className="panel-empty"><p>All products are well stocked.</p></div>}</section>
    </div>
  </>;
}
