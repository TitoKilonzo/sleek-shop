import { Bell, ExternalLink, Menu, ShoppingBag, X, type LucideIcon } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCart, useOrders, useSettings } from '../lib/db';
import type { OrderStatus } from '@sleek/shared';
import { UserMenu } from './UserMenu';

export type ConsoleNavItem = { to: string; label: string; icon: LucideIcon; end?: boolean; badge?: number };

/** Shared application shell: side navigation, top bar and content area. */
export function ConsoleShell({ title, nav, variant }: { title: string; nav: ConsoleNavItem[]; variant: 'admin' | 'account' }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const settings = useSettings();
  const orders = useOrders();
  const { itemCount } = useCart();
  const pending = orders.filter((order) => order.status === 'Pending').length;
  const current = [...nav].reverse().find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [location.pathname]);

  return <div className={`console console-${variant}`}>
    {open && <div className="console-scrim" onClick={() => setOpen(false)} />}
    <aside className={`console-side ${open ? 'is-open' : ''}`} aria-label={`${title} navigation`}>
      <div className="console-side-head">
        <Link to="/" className="brand-lockup console-brand"><span className="brand-mark">s.</span><span className="brand-word">sleek<span>shop</span><small>{title.toUpperCase()}</small></span></Link>
        <button className="icon-button console-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
      </div>
      <nav className="console-nav">
        <span className="console-nav-label">{variant === 'admin' ? 'MANAGE' : 'MY ACCOUNT'}</span>
        {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `console-link ${isActive ? 'is-active' : ''}`}><item.icon size={19} /><span>{item.label}</span>{item.badge ? <b>{item.badge}</b> : null}</NavLink>)}
      </nav>
      <div className="console-side-foot"><Link to="/shop" className="console-link"><ExternalLink size={18} /><span>View store</span></Link><small>{settings.storeName}</small></div>
    </aside>
    <div className="console-main">
      <header className="console-top">
        <button className="icon-button console-toggle" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        <div className="console-crumb"><span>{title}</span><span className="crumb-sep">/</span><strong>{current?.label ?? 'Overview'}</strong></div>
        <div className="console-top-actions">
          {variant === 'admin' ? <Link to="/admin/orders?status=Pending" className="console-bell" aria-label={`${pending} pending orders`}><Bell size={19} />{pending > 0 && <b>{pending}</b>}</Link> : <Link to="/cart" className="console-bell" aria-label={`Bag, ${itemCount} items`}><ShoppingBag size={19} />{itemCount > 0 && <b>{itemCount}</b>}</Link>}
          <UserMenu variant="console" />
        </div>
      </header>
      <div className="console-content"><Outlet /></div>
    </div>
  </div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return <div className="console-page-head"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{actions && <div className="console-page-actions">{actions}</div>}</div>;
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>;
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [onClose]);
  return <div className="modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
      <div className="modal-body">{children}</div>
    </div>
  </div>;
}
