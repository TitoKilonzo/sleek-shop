import { ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SmartImage } from '../components/SmartImage';
import { useToast } from '../context/ToastContext';
import { photo } from '@sleek/shared';
import { register, useAuth } from '../lib/db';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from;
  const image = photo('editorial');

  if (user) return <Navigate to="/account" replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '');
    if (text('password') !== text('confirm')) { setError('The passwords do not match.'); return; }
    setBusy(true);
    const result = await register({ name: text('name'), email: text('email'), phone: text('phone'), password: text('password') });
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    showToast('Your account has been created.');
    navigate(from ?? '/account', { replace: true });
  };

  return <div className="auth-page">
    <div className="auth-visual"><SmartImage src={image.src} fallback={image.fallback} alt="" /><div className="auth-visual-shade" /><div className="auth-visual-copy"><Link to="/" className="brand-lockup auth-brand"><span className="brand-mark">s.</span><span className="brand-word">sleek<span>shop</span></span></Link><h2>Create your account.</h2><p>Track orders, keep your delivery details and save products for later.</p></div></div>
    <div className="auth-panel"><div className="auth-card">
      <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to the shop</Link>
      <span className="eyebrow">NEW CUSTOMER</span><h1>Create account</h1><p className="auth-sub">It only takes a minute.</p>
      <form onSubmit={submit}>
        <label className="field"><span>Full name</span><input name="name" autoComplete="name" required minLength={2} onChange={() => setError('')} /></label>
        <div className="form-grid">
          <label className="field"><span>Email address</span><input name="email" type="email" autoComplete="email" required onChange={() => setError('')} /></label>
          <label className="field"><span>Phone number</span><input name="phone" type="tel" autoComplete="tel" required minLength={7} placeholder="+254 7XX XXX XXX" /></label>
          <label className="field"><span>Password</span><span className="password-field"><input name="password" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" onChange={() => setError('')} /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          <label className="field"><span>Confirm password</span><input name="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} onChange={() => setError('')} /></label>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="button button-primary auth-submit" disabled={busy}><span>{busy ? 'Creating account' : 'Create account'}</span><UserPlus size={17} /></button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login" state={{ from }}>Sign in</Link></p>
    </div></div>
  </div>;
}
