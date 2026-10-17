import { Search } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../../components/Console';
import { useToast } from '../../context/ToastContext';
import { formatDate, initials } from '../../lib/format';
import { money, setUserActive, useAuth, useOrders, useUsers } from '../../lib/db';

export function AdminCustomers() {
  const users = useUsers();
  const orders = useOrders();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();
  const rows = users.filter((user) => user.role === 'customer').map((user) => {
    const mine = orders.filter((order) => order.userId === user.id || order.email.toLowerCase() === user.email.toLowerCase());
    return { user, count: mine.length, spent: mine.filter((order) => order.status !== 'Cancelled').reduce((sum, order) => sum + order.total, 0) };
  }).filter(({ user }) => !term || [user.name, user.email, user.phone, user.city].some((field) => field.toLowerCase().includes(term)));
  const toggle = async (id: string, active: boolean) => { try { await setUserActive(id, !active); showToast(active ? 'Account deactivated.' : 'Account reactivated.'); } catch (err) { showToast(err instanceof Error ? err.message : 'Could not update the account.'); } };

  return <>
    <PageHeader title="Customers" subtitle={`${rows.length} registered customers.`} />
    <section className="panel">
      <div className="table-tools"><label className="tool-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, phone or city" aria-label="Search customers" /></label></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Customer</th><th>Phone</th><th>City</th><th>Orders</th><th>Total spent</th><th>Joined</th>{isAdmin && <th className="col-actions">Account</th>}</tr></thead><tbody>
        {rows.map(({ user, count, spent }) => <tr key={user.id}><td><div className="cell-person"><span className="avatar">{initials(user.name)}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></div></td><td>{user.phone}</td><td>{user.city || 'Not set'}</td><td>{count}</td><td>{money(spent)}</td><td>{formatDate(user.createdAt)}</td>{isAdmin && <td className="col-actions"><button className={`switch ${user.active ? 'is-on' : ''}`} onClick={() => toggle(user.id, user.active)} role="switch" aria-checked={user.active} aria-label={`${user.active ? 'Deactivate' : 'Reactivate'} ${user.name}`}><i /></button></td>}</tr>)}
        {!rows.length && <tr><td colSpan={7} className="table-empty">No customers match your search.</td></tr>}
      </tbody></table></div>
    </section>
  </>;
}
