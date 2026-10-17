import { ArrowLeft, Eye, EyeOff, LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SmartImage } from '../components/SmartImage';
import { useToast } from '../context/ToastContext';
import { photo } from '@sleek/shared';
import { login, useAuth } from '../lib/db';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from;
  const hero = photo('hero');

  if (user) return <Navigate to={from ?? (user.role === 'customer' ? '/account' : '/admin')} replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const result = await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''));
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    showToast(`Welcome back, ${result.user.name.split(' ')[0]}.`);
    navigate(from ?? (result.user.role === 'customer' ? '/account' : '/admin'), { replace: true });
  };

  return <div className="auth-page">
    <div className="auth-visual"><SmartImage src={hero.src} fallback={hero.fallback} alt="" /><div className="auth-visual-shade" /><div className="auth-visual-copy"><Link to="/" className="brand-lockup auth-brand"><span className="brand-mark">s.</span><span className="brand-word">sleek<span>shop</span></span></Link><h2>Everyday essentials, chosen with care.</h2><p>Sign in to track your orders, save your favourites and check out faster.</p></div></div>
    <div className="auth-panel"><div className="auth-card">
      <Link to="/" className="back-link"><ArrowLeft size={15} /> Back to the shop</Link>
      <span className="eyebrow">WELCOME BACK</span><h1>Sign in</h1><p className="auth-sub">Enter your details to access your account.</p>
      <form onSubmit={submit} noValidate>
        <label className="field"><span>Email address</span><input name="email" type="email" autoComplete="username" required autoFocus placeholder="you@example.com" onChange={() => setError('')} /></label>
        <label className="field"><span>Password</span><span className="password-field"><input name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required placeholder="Enter your password" onChange={() => setError('')} /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="button button-primary auth-submit" disabled={busy}><span>{busy ? 'Signing in' : 'Sign in'}</span><LogIn size={17} /></button>
      </form>
      <p className="auth-switch">New to Sleek Shop? <Link to="/register" state={{ from }}>Create an account</Link></p>
    </div></div>
  </div>;
}
