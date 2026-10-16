import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <section className="page-shell section-block not-found"><span className="not-found-mark"><Compass size={28} /></span><span className="eyebrow">A LITTLE OFF THE MAP</span><h1>This page wandered <em>off the edit.</em></h1><p>The page you're looking for may have moved or may not exist.</p><Link to="/" className="button button-primary"><ArrowLeft size={16} /> Back to Sleek Shop</Link></section>;
}
