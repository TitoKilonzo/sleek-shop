import { ArrowDownUp, Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { getProducts } from '../lib/api';
import type { Product } from '../lib/types';

const categoryOptions = ['All items', 'Bags', 'Footwear', 'Tech', 'Laptops', 'Accessories'];

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'featured';
  const [searchValue, setSearchValue] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setSearchValue(query), [query]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getProducts({ search: query, category, sort, limit: 48 })
      .then((result) => { if (active) setProducts(result); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load products.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, category, sort]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || (key === 'category' && value === 'All items')) next.delete(key); else next.set(key, value);
    setParams(next);
  };
  const submitSearch = (event: FormEvent) => { event.preventDefault(); updateParam('q', searchValue.trim()); };
  const heading = category || (query ? `Results for “${query}”` : 'The full collection');

  return <section className="page-shell shop-page section-block"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Shop</span></div><div className="shop-intro"><div><span className="eyebrow">THE SLEEK COLLECTION</span><h1>{heading}</h1><p>Useful things, beautiful details and everyday favourites worth keeping close.</p></div><div className="shop-intro-note"><span>CURATED WITH CARE</span><span>STYLE · TECH · EVERYDAY</span></div></div>
    <div className="shop-toolbar"><form className="shop-search" onSubmit={submitSearch}><Search size={17} /><input aria-label="Search the collection" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search the collection" />{searchValue && <button type="button" aria-label="Clear search" onClick={() => { setSearchValue(''); updateParam('q', ''); }}><X size={15} /></button>}<button type="submit" className="search-submit">Search</button></form><button className={`filter-toggle ${filtersOpen ? 'is-active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} /> Filters <Filter size={14} /></button><label className="sort-select"><ArrowDownUp size={15} /><span>Sort:</span><select aria-label="Sort products" value={sort} onChange={(event) => updateParam('sort', event.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option></select></label></div>
    <div className="shop-content">{filtersOpen && <aside className="filter-panel"><div className="filter-panel-title"><h3>Categories</h3><button onClick={() => { setParams(new URLSearchParams()); setFiltersOpen(false); }}>Clear all</button></div>{categoryOptions.map((option) => <button key={option} className={`filter-option ${(category || 'All items') === option ? 'selected' : ''}`} onClick={() => updateParam('category', option)}><span className="filter-radio" />{option}</button>)}<div className="filter-note">More specific product filters will be added as the catalogue grows.</div></aside>}
      <div className="shop-results"><div className="results-heading"><span>{loading ? 'Finding your edit…' : `${products.length} ${products.length === 1 ? 'piece' : 'pieces'} to explore`}</span>{(query || category) && <button onClick={() => setParams(new URLSearchParams())}>Clear search & filters <X size={13} /></button>}</div>{loading ? <div className="product-grid">{Array.from({ length: 8 }).map((_, i) => <div className="product-skeleton" key={i}><div /><span /><span /></div>)}</div> : error ? <div className="empty-state"><h3>We couldn't load the collection.</h3><p>{error} Please check the API connection and retry.</p><button className="button button-secondary" onClick={() => window.location.reload()}>Try again</button></div> : products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={22} /></span><h3>No pieces found just yet.</h3><p>Try a different search or browse another category.</p><button className="button button-secondary" onClick={() => setParams(new URLSearchParams())}>View all products</button></div>}</div>
    </div><div className="shop-bottom-note">A good find is even better when it fits your everyday. <span>— THE SLEEK EDIT</span></div></section>;
}
