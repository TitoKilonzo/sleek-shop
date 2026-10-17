import { ArrowRight, ArrowUpRight, BadgeCheck, PackageCheck, RefreshCcw, ShieldCheck, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { SmartImage } from '../components/SmartImage';
import { categories, photo } from '@sleek/shared';
import { queryProducts, useProducts } from '../lib/db';

export function HomePage() {
  const products = useProducts();
  const featured = queryProducts(products, { sort: 'featured' }).slice(0, 8);
  const hero = photo('hero');
  const editorial = photo('editorial');
  return <>
    <section className="hero-section page-shell">
      <div className="hero-copy">
        <span className="eyebrow">NEW SEASON COLLECTION</span>
        <h1>Everyday essentials,<br /><em>chosen with care.</em></h1>
        <p>Bags, footwear, technology and accessories from trusted brands, delivered across Kenya.</p>
        <div className="hero-actions"><Link to="/shop" className="button button-primary">Shop the collection <ArrowUpRight size={17} /></Link><Link to="/shop?sort=featured" className="text-link">New arrivals <ArrowRight size={16} /></Link></div>
        <div className="hero-footnote"><p><strong>Pay on delivery.</strong><br />Cash or M-Pesa when your order arrives.</p></div>
      </div>
      <div className="hero-visual">
        <SmartImage className="hero-image" src={hero.src} fallback={hero.fallback} alt="Contemporary everyday fashion" fetchPriority="high" />
        <div className="hero-image-shade" />
        <div className="hero-note"><span className="hero-note-icon"><BadgeCheck size={18} /></span><span><strong>Quality checked</strong><small>Every item inspected before dispatch</small></span></div>
        <div className="hero-image-caption"><span>NEW SEASON</span><span>SLEEK SHOP</span></div>
      </div>
    </section>

    <section className="trust-strip"><div className="page-shell trust-grid">
      <div><ShieldCheck size={20} /><span><strong>Trusted brands</strong><small>Carefully selected products</small></span></div>
      <div><PackageCheck size={20} /><span><strong>Order updates</strong><small>Follow every step of delivery</small></span></div>
      <div><RefreshCcw size={20} /><span><strong>Easy exchanges</strong><small>Within 7 days of delivery</small></span></div>
      <div><Wallet size={20} /><span><strong>Pay on delivery</strong><small>Cash or M-Pesa</small></span></div>
    </div></section>

    <section className="page-shell section-block category-section">
      <div className="section-heading"><div><span className="eyebrow">CATEGORIES</span><h2>Shop by <em>category.</em></h2><p>Browse bags, footwear, technology and more.</p></div><Link to="/shop" className="text-link">All products <ArrowRight size={16} /></Link></div>
      <div className="category-grid">{categories.slice(0, 4).map((category, index) => <Link to={`/shop?category=${encodeURIComponent(category.name)}`} className={`category-tile category-tile-${index + 1}`} key={category.slug}>
        <SmartImage src={category.image} fallback={category.imageFallback} alt={category.name} loading="lazy" />
        <div className="category-overlay" /><span className="category-index">0{index + 1}</span>
        <div className="category-info"><span>{category.subtitle}</span><h3>{category.name}</h3></div>
        <span className="category-arrow"><ArrowUpRight size={19} /></span>
      </Link>)}</div>
    </section>

    <section className="featured-section"><div className="page-shell section-block">
      <div className="section-heading"><div><span className="eyebrow">FEATURED</span><h2>Popular <em>right now.</em></h2><p>Customer favourites and the latest arrivals.</p></div><Link to="/shop" className="text-link">View all <ArrowRight size={16} /></Link></div>
      {featured.length ? <div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h3>No products available.</h3><p>Please check back soon.</p></div>}
    </div></section>

    <section className="editorial-section page-shell">
      <div className="editorial-image"><SmartImage src={editorial.src} fallback={editorial.fallback} alt="Everyday style from the Sleek Shop collection" loading="lazy" /><span className="editorial-stamp">NEW<br />IN<br />STORE</span></div>
      <div className="editorial-copy"><span className="eyebrow">OUR APPROACH</span><h2>Fewer things.<br /><em>Better made.</em></h2><p>We choose pieces that work hard, feel good and last. Every product in the collection is checked for quality, described honestly and priced fairly, so you can buy with confidence.</p><Link to="/shop" className="button button-primary">Explore the collection <ArrowUpRight size={17} /></Link></div>
    </section>

    <section className="promise-section"><div className="page-shell promise-inner"><div><span className="eyebrow eyebrow-light">OUR PROMISE</span><h2>Clear details.<br /><em>Honest prices.</em></h2></div><p>Accurate product information, transparent delivery fees and support that continues after checkout.</p><Link to="/shop" className="promise-link">Shop now <ArrowUpRight size={17} /></Link></div></section>
  </>;
}
