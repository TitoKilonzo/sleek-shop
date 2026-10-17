import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { subscribe, useSettings } from '../lib/db';

export function Footer() {
  const { showToast } = useToast();
  const settings = useSettings();
  const [email, setEmail] = useState('');
  const onSubscribe = async (event: FormEvent) => {
    event.preventDefault();
    try {
      showToast(await subscribe(email) ? 'Thank you. You are now subscribed to our newsletter.' : 'This email address is already subscribed.');
      setEmail('');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Could not subscribe. Please try again.'); }
  };
  return <footer className="site-footer">
    <div className="footer-newsletter"><div className="page-shell newsletter-inner"><div><span className="eyebrow eyebrow-light">NEWSLETTER</span><h2>New arrivals, <em>straight to your inbox.</em></h2><p>Product launches, restocks and offers. One email a week at most.</p></div><form className="newsletter-form" onSubmit={onSubscribe}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button type="submit" aria-label="Subscribe to the newsletter"><ArrowUpRight size={19} /></button><small>You can unsubscribe at any time.</small></form></div></div>
    <div className="page-shell footer-main">
      <div className="footer-brand"><Link to="/" className="brand-lockup footer-brand-lockup"><span className="brand-mark">s.</span><span className="brand-word">sleek<span>shop</span><small>EVERYDAY ESSENTIALS</small></span></Link><p>Considered style, everyday technology and small essentials, delivered across Kenya.</p></div>
      <div className="footer-column"><h3>Shop</h3><Link to="/shop">All products</Link><Link to="/shop?category=Bags">Bags</Link><Link to="/shop?category=Footwear">Footwear</Link><Link to="/shop?category=Tech">Technology</Link></div>
      <div className="footer-column"><h3>Help and information</h3><Link to="/help/delivery">Delivery information</Link><Link to="/help/returns">Returns and exchanges</Link><Link to="/contact">Contact us</Link><Link to="/help/privacy">Privacy policy</Link><Link to="/help/terms">Terms of service</Link></div>
      <div className="footer-column footer-contact"><h3>Contact</h3><p><Mail size={15} /> {settings.supportEmail}</p><p><Phone size={15} /> {settings.supportPhone}</p><p><MapPin size={15} /> {settings.address}</p></div>
    </div>
    <div className="page-shell footer-bottom"><span>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</span><span>{settings.hours}</span></div>
  </footer>;
}
