import { ChevronDown, Heart, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { initials } from '../lib/format';
import { logout, useAuth } from '../lib/db';

export function UserMenu({ variant = 'store' }: { variant?: 'store' | 'console' }) {
  const { user, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!user) return <Link to="/login" className="header-action account-action"><UserRound size={19} /><span>Sign in</span></Link>;

  const signOut = async () => { setOpen(false); await logout(); showToast('You have been signed out.'); navigate('/'); };
  const roleLabel = user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Store manager' : 'Customer';
  const close = () => setOpen(false);

  return <div className={`user-menu user-menu-${variant}`} ref={ref}>
    <button className="user-menu-trigger" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}>
      <span className="avatar">{initials(user.name)}</span>
      <span className="user-menu-text"><strong>{user.name.split(' ')[0]}</strong><small>{roleLabel}</small></span>
      <ChevronDown size={15} className="user-menu-caret" />
    </button>
    {open && <div className="user-menu-panel" role="menu">
      <div className="user-menu-id"><span className="avatar avatar-lg">{initials(user.name)}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div>
      {isStaff && <Link role="menuitem" to="/admin" onClick={close}><LayoutDashboard size={16} /> Admin console</Link>}
      <Link role="menuitem" to="/account" onClick={close}><UserRound size={16} /> My account</Link>
      <Link role="menuitem" to="/account/orders" onClick={close}><Package size={16} /> My orders</Link>
      <Link role="menuitem" to="/saved" onClick={close}><Heart size={16} /> Saved items</Link>
      <button role="menuitem" onClick={signOut} className="user-menu-signout"><LogOut size={16} /> Sign out</button>
    </div>}
  </div>;
}
