import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <section className="page-shell section-block not-found"><span className="not-found-mark"><Compass size={28} /></span><span className="eyebrow">ERROR 404</span><h1>Page <em>not found.</em></h1><p>The page you are looking for may have moved or no longer exists.</p><Link to="/" className="button button-primary"><ArrowLeft size={16} /> Back to home</Link></section>;
}
