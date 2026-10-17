import { ArrowDownUp, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { categoryNames } from '@sleek/shared';
import { queryProducts, useProducts } from '../lib/db';

const categoryOptions = ['All items', ...categoryNames];

export function ShopPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'featured';
  const [searchValue, setSearchValue] = useState(query);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const all = useProducts();
  const products = queryProducts(all, { search: query, category, sort });

  useEffect(() => setSearchValue(query), [query]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || (key === 'category' && value === 'All items')) next.delete(key); else next.set(key, value);
    setParams(next);
  };
  const submitSearch = (event: FormEvent) => { event.preventDefault(); updateParam('q', searchValue.trim()); };
  const heading = category || (query ? `Results for “${query}”` : 'All products');

  return <section className="page-shell shop-page section-block">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>Shop</span></div>
    <div className="shop-intro"><div><span className="eyebrow">THE COLLECTION</span><h1>{heading}</h1><p>Bags, footwear, technology and accessories for every day.</p></div></div>
    <div className="shop-toolbar">
      <form className="shop-search" onSubmit={submitSearch}><Search size={17} /><input aria-label="Search the collection" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search the collection" />{searchValue && <button type="button" aria-label="Clear search" onClick={() => { setSearchValue(''); updateParam('q', ''); }}><X size={15} /></button>}<button type="submit" className="search-submit">Search</button></form>
      <button className={`filter-toggle ${filtersOpen ? 'is-active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><SlidersHorizontal size={16} /> Filters</button>
      <label className="sort-select"><ArrowDownUp size={15} /><span>Sort by</span><select aria-label="Sort products" value={sort} onChange={(event) => updateParam('sort', event.target.value)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Top rated</option></select></label>
    </div>
    <div className="shop-content">
      {filtersOpen && <aside className="filter-panel"><div className="filter-panel-title"><h3>Categories</h3><button onClick={() => { setParams(new URLSearchParams()); setFiltersOpen(false); }}>Clear all</button></div>{categoryOptions.map((option) => <button key={option} className={`filter-option ${(category || 'All items').toLowerCase() === option.toLowerCase() ? 'selected' : ''}`} onClick={() => updateParam('category', option)}><span className="filter-radio" />{option}</button>)}</aside>}
      <div className="shop-results">
        <div className="results-heading"><span>{products.length} {products.length === 1 ? 'product' : 'products'}</span>{(query || category) && <button onClick={() => setParams(new URLSearchParams())}>Clear search and filters <X size={13} /></button>}</div>
        {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><span className="empty-icon"><Search size={22} /></span><h3>No products found.</h3><p>Try a different search or browse another category.</p><button className="button button-secondary" onClick={() => setParams(new URLSearchParams())}>View all products</button></div>}
      </div>
    </div>
  </section>;
}
