import { ImagePlus, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Modal, PageHeader } from '../../components/Console';
import { SmartImage } from '../../components/SmartImage';
import { useToast } from '../../context/ToastContext';
import { categoryNames } from '@sleek/shared';
import { deleteProduct, money, saveProduct, setProductActive, useAuth, useProducts, useSettings } from '../../lib/db';
import type { Product } from '@sleek/shared';

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('This file is not a valid image.'));
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function ProductForm({ product, onClose }: { product?: Product; onClose: () => void }) {
  const { showToast } = useToast();
  const [image, setImage] = useState(product?.image ?? '');
  const [error, setError] = useState('');
  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { setImage(await resizeImage(file)); setError(''); } catch (err) { setError(err instanceof Error ? err.message : 'Could not use this image.'); }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '').trim();
    const price = Number(text('price'));
    const compare = Number(text('compareAtPrice'));
    if (!(price > 0)) { setError('Enter a price greater than zero.'); return; }
    if (compare && compare <= price) { setError('The compare at price must be higher than the selling price.'); return; }
    try {
    await saveProduct({
      id: product?.id, name: text('name'), brand: text('brand'), category: text('category'), sku: text('sku'), description: text('description'),
      price, compareAtPrice: compare || undefined, stock: Math.max(0, Math.floor(Number(text('stock')) || 0)), badge: text('badge') || undefined,
      featured: form.get('featured') === 'on', active: form.get('active') === 'on', image: image.trim(), imageFallback: image.trim() === product?.image ? product?.imageFallback : undefined,
    });
    showToast(product ? 'Product updated.' : 'Product added.');
    onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'The product could not be saved.'); }
  };
  return <Modal title={product ? 'Edit product' : 'Add product'} onClose={onClose} wide>
    <form onSubmit={submit} className="modal-form">
      <div className="form-grid">
        <label className="field field-full"><span>Product name *</span><input name="name" required minLength={2} defaultValue={product?.name} /></label>
        <label className="field"><span>Brand *</span><input name="brand" required defaultValue={product?.brand} /></label>
        <label className="field"><span>Category *</span><select name="category" defaultValue={product?.category ?? categoryNames[0]}>{categoryNames.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label className="field"><span>SKU *</span><input name="sku" required defaultValue={product?.sku} placeholder="SS-BAG-013" /></label>
        <label className="field"><span>Badge <small>Optional</small></span><input name="badge" maxLength={20} defaultValue={product?.badge} placeholder="New arrival" /></label>
        <label className="field"><span>Price (KES) *</span><input name="price" type="number" min={1} step={1} required defaultValue={product?.price} /></label>
        <label className="field"><span>Compare at price (KES) <small>Optional</small></span><input name="compareAtPrice" type="number" min={0} step={1} defaultValue={product?.compareAtPrice} /></label>
        <label className="field"><span>Stock quantity *</span><input name="stock" type="number" min={0} step={1} required defaultValue={product?.stock ?? 10} /></label>
        <div className="field"><span>Product image</span><div className="image-input"><span className="image-input-preview">{image ? <SmartImage src={image} fallback={product?.imageFallback} alt="Preview" /> : <ImagePlus size={20} />}</span><label className="button button-secondary button-sm file-button">Upload photo<input type="file" accept="image/*" onChange={onFile} hidden /></label></div></div>
        <label className="field field-full"><span>Image URL or path <small>Optional, or upload a photo above</small></span><input value={image.startsWith('data:') ? '' : image} onChange={(event) => setImage(event.target.value)} placeholder="https://" /></label>
        <label className="field field-full"><span>Description *</span><textarea name="description" required rows={4} minLength={10} defaultValue={product?.description} /></label>
      </div>
      <div className="check-row"><label className="check"><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> Featured on the home page</label><label className="check"><input type="checkbox" name="active" defaultChecked={product?.active ?? true} /> Visible in the store</label></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="modal-actions"><button type="button" className="button button-secondary button-sm" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary button-sm">{product ? 'Save changes' : 'Add product'}</button></div>
    </form>
  </Modal>;
}

export function AdminProducts() {
  const products = useProducts();
  const settings = useSettings();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [removing, setRemoving] = useState<Product | null>(null);
  const term = search.trim().toLowerCase();
  const rows = products.filter((product) => (!category || product.category === category) && (!term || [product.name, product.sku, product.brand].some((field) => field.toLowerCase().includes(term))));
  const toggle = async (product: Product) => { try { await setProductActive(product.id, !product.active); showToast(product.active ? 'Product hidden from the store.' : 'Product is now visible in the store.'); } catch (err) { showToast(err instanceof Error ? err.message : 'Could not update the product.'); } };

  return <>
    <PageHeader title="Products" subtitle={`${products.length} products in the catalogue.`} actions={<button className="button button-primary button-sm" onClick={() => setEditing('new')}><Plus size={16} /> Add product</button>} />
    <section className="panel">
      <div className="table-tools"><label className="tool-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, SKU or brand" aria-label="Search products" /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categoryNames.map((name) => <option key={name}>{name}</option>)}</select></div>
      <div className="table-wrap"><table className="data-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visibility</th><th className="col-actions">Actions</th></tr></thead><tbody>
        {rows.map((product) => <tr key={product.id}>
          <td><div className="cell-product"><SmartImage src={product.image} fallback={product.imageFallback} alt={product.name} /><span><strong>{product.name}</strong><small>{product.sku} · {product.brand}</small></span></div></td>
          <td>{product.category}</td>
          <td>{money(product.price)}</td>
          <td><span className={product.stock === 0 ? 'chip chip-danger' : product.stock <= settings.lowStockLevel ? 'chip chip-warn' : 'chip chip-ok'}>{product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}</span></td>
          <td><button className={`switch ${product.active ? 'is-on' : ''}`} onClick={() => toggle(product)} role="switch" aria-checked={product.active} aria-label={`${product.active ? 'Hide' : 'Show'} ${product.name}`}><i /></button></td>
          <td className="col-actions"><button className="icon-button" onClick={() => setEditing(product)} aria-label={`Edit ${product.name}`}><Pencil size={17} /></button>{isAdmin && <button className="icon-button icon-danger" onClick={() => setRemoving(product)} aria-label={`Delete ${product.name}`}><Trash2 size={17} /></button>}</td>
        </tr>)}
        {!rows.length && <tr><td colSpan={6} className="table-empty">No products match your search.</td></tr>}
      </tbody></table></div>
    </section>
    {editing && <ProductForm product={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    {removing && <Modal title="Delete product" onClose={() => setRemoving(null)}><p className="confirm-text">Delete <strong>{removing.name}</strong>? Existing orders keep their records, but the product will be removed from the store.</p><div className="modal-actions"><button className="button button-secondary button-sm" onClick={() => setRemoving(null)}>Cancel</button><button className="button button-danger button-sm" onClick={async () => { try { await deleteProduct(removing.id); showToast('Product deleted.'); } catch (err) { showToast(err instanceof Error ? err.message : 'Could not delete the product.'); } setRemoving(null); }}>Delete product</button></div></Modal>}
  </>;
}
