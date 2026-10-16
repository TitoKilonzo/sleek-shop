import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, PackageCheck, RefreshCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { getCategories, getProducts } from '../lib/api';
import type { Category, Product } from '../lib/types';

const fallbackCategories: Category[] = [
  { name: 'Bags', slug: 'bags', subtitle: 'Carry it beautifully', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=720&q=85' },
  { name: 'Footwear', slug: 'footwear', subtitle: 'Step into your style', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=720&q=85' },
  { name: 'Tech', slug: 'tech', subtitle: 'Smarter everyday gear', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=720&q=85' },
  { name: 'Laptops', slug: 'laptops', subtitle: 'Work, study, create', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=720&q=85' },
];

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getProducts({ limit: 8, sort: 'featured' }), getCategories()])
      .then(([nextProducts, nextCategories]) => { if (!controller.signal.aborted) { setProducts(nextProducts); setCategories(nextCategories); setLoadError(false); } })
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <>
    <section className="hero-section page-shell">
      <div className="hero-copy"><span className="eyebrow"><Sparkles size={13} /> THE EVERYDAY, ELEVATED</span><h1>Good taste.<br /><em>Better finds.</em></h1><p>A considered collection of style, technology and everyday essentials. Good things, chosen with you in mind.</p><div className="hero-actions"><Link to="/shop" className="button button-primary">Explore the collection <ArrowUpRight size={17} /></Link><Link to="/shop?sort=featured" className="text-link">What’s new <ArrowRight size={16} /></Link></div><div className="hero-footnote"><div className="avatar-stack"><span>SL</span><span>MK</span><span>AN</span></div><p><strong>Thoughtfully selected.</strong><br />Made for your everyday.</p></div></div>
      <div className="hero-visual"><img className="hero-image" src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90" alt="Contemporary everyday fashion styling" fetchPriority="high" /><div className="hero-image-shade" /><div className="hero-note"><span className="hero-note-icon"><BadgeCheck size={18} /></span><span><strong>The Sleek standard</strong><small>Style meets function</small></span></div><div className="hero-image-caption"><span>01 / THE NEW EVERYDAY</span><span>STYLE, CONSIDERED</span></div></div>
      <div className="hero-side-label">DISCOVER YOUR NEXT FAVOURITE</div>
    </section>

    <section className="trust-strip"><div className="page-shell trust-grid"><div><ShieldCheck size={20} /><span><strong>Thoughtfully selected</strong><small>Quality over clutter</small></span></div><div><PackageCheck size={20} /><span><strong>Clear delivery updates</strong><small>Know where your order is</small></span></div><div><RefreshCcw size={20} /><span><strong>Care, after checkout</strong><small>Support when you need it</small></span></div><div><BadgeCheck size={20} /><span><strong>A better everyday</strong><small>Little things, done well</small></span></div></div></section>

    <section className="page-shell section-block category-section"><div className="section-heading"><div><span className="eyebrow">A PLACE FOR GOOD THINGS</span><h2>Find your <em>kind of thing.</em></h2><p>From the pieces you wear to the things you use every day.</p></div><Link to="/shop" className="text-link">Shop all categories <ArrowRight size={16} /></Link></div><div className="category-grid">{categories.slice(0, 4).map((category, index) => <Link to={`/shop?category=${encodeURIComponent(category.name)}`} className={`category-tile category-tile-${index + 1}`} key={category.slug}><img src={category.imageUrl} alt={category.name} loading="lazy" /><div className="category-overlay" /><span className="category-index">0{index + 1}</span><div className="category-info"><span>{category.subtitle}</span><h3>{category.name}</h3></div><span className="category-arrow"><ArrowUpRight size={19} /></span></Link>)}</div></section>

    <section className="featured-section"><div className="page-shell section-block"><div className="section-heading"><div><span className="eyebrow">THE PIECES PEOPLE LOVE</span><h2>Consider this <em>your edit.</em></h2><p>Easy favourites, useful upgrades and a few things worth discovering.</p></div><Link to="/shop" className="text-link">View everything <ArrowRight size={16} /></Link></div>{loading ? <div className="product-grid">{Array.from({ length: 4 }).map((_, i) => <div className="product-skeleton" key={i}><div /><span /><span /></div>)}</div> : products.length ? <div className="product-grid">{products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h3>{loadError ? 'We’re having a little connection trouble.' : 'New finds are on their way.'}</h3><p>{loadError ? 'Check that the Sleek API is running, then try again.' : 'Please check back soon for the first edit.'}</p><Link to="/shop" className="button button-secondary">Browse collection</Link></div>}</div></section>

    <section className="editorial-section page-shell"><div className="editorial-image"><img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=85" alt="A curated selection of contemporary everyday style" loading="lazy" /><span className="editorial-stamp">THE<br />SLEEK<br />EDIT</span></div><div className="editorial-copy"><span className="eyebrow">LESS, BUT BETTER</span><h2>Not just more<br />things. <em>Better things.</em></h2><p>We believe the right everyday pieces should work hard, feel good and make getting ready that little bit easier. We’re building a place for thoughtful choices, useful design and style that feels like you.</p><Link to="/shop" className="button button-primary">Meet your next favourite <ArrowUpRight size={17} /></Link><div className="editorial-signoff">SLEEK SHOP <ArrowDownRight size={15} /> CURATED EVERYDAY</div></div></section>

    <section className="promise-section"><div className="page-shell promise-inner"><div><span className="eyebrow eyebrow-light">THE SLEEK PROMISE</span><h2>Good shopping should<br /><em>feel good, too.</em></h2></div><p>Clear product details, honest pricing and care that doesn’t disappear after checkout. That’s the standard we’re working toward, every day.</p><Link to="/shop" className="promise-link">Shop with intention <ArrowUpRight size={17} /></Link></div></section>
  </>;
}
