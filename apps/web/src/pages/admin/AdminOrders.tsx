import { Download, Search } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, PageHeader, StatusBadge } from '../../components/Console';
import { SmartImage } from '../../components/SmartImage';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../lib/format';
import { money, updateOrderStatus, useOrders } from '../../lib/db';
import { ORDER_STATUSES, type Order, type OrderStatus } from '@sleek/shared';

function exportCsv(orders: Order[]) {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const header = ['Order', 'Date', 'Customer', 'Email', 'Phone', 'City', 'Items', 'Subtotal', 'Delivery', 'Total', 'Payment', 'Status'];
  const lines = orders.map((o) => [o.id, o.createdAt, o.customerName, o.email, o.phone, o.city, o.items.map((i) => `${i.quantity} x ${i.name}`).join('; '), o.subtotal, o.shipping, o.total, o.payment, o.status].map(escape).join(','));
  const blob = new Blob([[header.map(escape).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `sleek-shop-orders-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
  URL.revokeObjectURL(url);
}

export function AdminOrders() {
  const orders = useOrders();
  const [params, setParams] = useSearchParams();
  const { showToast } = useToast();
  const status = params.get('status') ?? '';
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [openId, setOpenId] = useState<string | null>(null);
  const term = search.trim().toLowerCase();
  const rows = orders.filter((order) => (!status || order.status === status) && (!term || [order.id, order.customerName, order.email, order.phone].some((field) => field.toLowerCase().includes(term))));
  const selected = orders.find((order) => order.id === openId) ?? null;
  const setStatus = (value: string) => { const next = new URLSearchParams(params); if (value) next.set('status', value); else next.delete('status'); setParams(next, { replace: true }); };

  return <>
    <PageHeader title="Orders" subtitle="Review, confirm and update customer orders." actions={<button className="button button-secondary button-sm" onClick={() => exportCsv(rows)} disabled={!rows.length}><Download size={16} /> Export CSV</button>} />
    <section className="panel">
      <div className="tabs" role="tablist">{['', ...ORDER_STATUSES].map((value) => <button key={value || 'all'} role="tab" aria-selected={status === value} className={status === value ? 'is-active' : ''} onClick={() => setStatus(value)}>{value || 'All'}<b>{value ? orders.filter((order) => order.status === value).length : orders.length}</b></button>)}</div>
      <div className="table-tools"><label className="tool-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order number, name, email or phone" aria-label="Search orders" /></label></div>
      <div className="table-wrap"><table className="data-table data-table-click"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead><tbody>
        {rows.map((order) => <tr key={order.id} onClick={() => setOpenId(order.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') setOpenId(order.id); }}><td><strong>{order.id}</strong></td><td><span className="cell-stack"><strong>{order.customerName}</strong><small>{order.city}</small></span></td><td>{formatDateTime(order.createdAt)}</td><td>{order.payment}</td><td>{money(order.total)}</td><td><StatusBadge status={order.status} /></td></tr>)}
        {!rows.length && <tr><td colSpan={6} className="table-empty">No orders match your filters.</td></tr>}
      </tbody></table></div>
    </section>
    {selected && <Modal title={`Order ${selected.id}`} onClose={() => setOpenId(null)} wide>
      <div className="order-detail">
        <div className="order-detail-top"><div><small>Placed</small><strong>{formatDateTime(selected.createdAt)}</strong></div><label className="field"><span>Order status</span><select value={selected.status} onChange={async (event) => { const value = event.target.value as OrderStatus; try { await updateOrderStatus(selected.id, value); showToast(`Order ${selected.id} marked as ${value.toLowerCase()}.`); } catch (err) { showToast(err instanceof Error ? err.message : 'Could not update the order.'); } }}>{ORDER_STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label></div>
        <div className="detail-cols">
          <div><h3>Customer</h3><p><strong>{selected.customerName}</strong><br />{selected.email}<br />{selected.phone}</p></div>
          <div><h3>Delivery address</h3><p>{selected.address}<br />{selected.city}{selected.notes && <><br /><em>Note: {selected.notes}</em></>}</p></div>
          <div><h3>Payment</h3><p>{selected.payment}</p></div>
        </div>
        <div className="order-lines">{selected.items.map((item) => <div className="order-line" key={item.productId}><SmartImage src={item.image} fallback={item.imageFallback} alt={item.name} /><div><strong>{item.name}</strong><small>{money(item.price)} × {item.quantity}</small></div><span>{money(item.price * item.quantity)}</span></div>)}</div>
        <div className="order-totals"><div><span>Subtotal</span><strong>{money(selected.subtotal)}</strong></div><div><span>Delivery</span><strong>{selected.shipping === 0 ? 'Free' : money(selected.shipping)}</strong></div><div className="order-totals-final"><span>Total</span><strong>{money(selected.total)}</strong></div></div>
      </div>
    </Modal>}
  </>;
}
