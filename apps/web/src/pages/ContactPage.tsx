import { CheckCircle2, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendMessage, useAuth, useSettings } from '../lib/db';

export function ContactPage() {
  const settings = useSettings();
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '').trim();
    setBusy(true); setError('');
    try { await sendMessage({ name: text('name'), email: text('email'), subject: text('subject'), body: text('body') }); setSent(true); } catch (err) { setError(err instanceof Error ? err.message : 'Your message could not be sent.'); }
    setBusy(false);
  };
  return <section className="page-shell section-block contact-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Contact us</span></div>
    <div className="checkout-heading"><span className="eyebrow">CONTACT</span><h1>How can we <em>help?</em></h1><p>Send us a message and we will reply within one working day.</p></div>
    <div className="contact-layout">
      {sent ? <div className="contact-success"><CheckCircle2 size={34} /><h2>Message sent.</h2><p>Thank you for getting in touch. A member of our team will reply by email within one working day.</p><button className="button button-secondary" onClick={() => setSent(false)}>Send another message</button></div> : <form className="checkout-form contact-form" onSubmit={submit}>
        <div className="form-grid">
          <label className="field"><span>Full name *</span><input name="name" required minLength={2} defaultValue={user?.name ?? ''} autoComplete="name" /></label>
          <label className="field"><span>Email address *</span><input name="email" type="email" required defaultValue={user?.email ?? ''} autoComplete="email" /></label>
          <label className="field field-full"><span>Subject *</span><input name="subject" required minLength={3} maxLength={120} /></label>
          <label className="field field-full"><span>Message *</span><textarea name="body" required minLength={10} maxLength={2000} rows={6} /></label>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button type="submit" className="button button-primary" disabled={busy}>{busy ? 'Sending' : 'Send message'}</button>
      </form>}
      <aside className="contact-card"><h2>Store details</h2>
        <p><Mail size={17} /><span><strong>Email</strong>{settings.supportEmail}</span></p>
        <p><Phone size={17} /><span><strong>Phone</strong>{settings.supportPhone}</span></p>
        <p><MapPin size={17} /><span><strong>Address</strong>{settings.address}</span></p>
        <p><Clock size={17} /><span><strong>Opening hours</strong>{settings.hours}</span></p>
      </aside>
    </div>
  </section>;
}
