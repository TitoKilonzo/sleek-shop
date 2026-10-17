import { RotateCcw } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Modal, PageHeader } from '../../components/Console';
import { useToast } from '../../context/ToastContext';
import { remoteMode, saveSettings, useSettings } from '../../lib/db';
import { resetAllStores } from '../../lib/store';

export function AdminSettings() {
  const settings = useSettings();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '').trim();
    const number = (name: string) => Math.max(0, Math.round(Number(text(name)) || 0));
    try {
    await saveSettings({ storeName: text('storeName'), supportEmail: text('supportEmail'), supportPhone: text('supportPhone'), address: text('address'), hours: text('hours'), announcement: text('announcement'), shippingFee: number('shippingFee'), freeShippingThreshold: number('freeShippingThreshold'), lowStockLevel: number('lowStockLevel') });
    showToast('Settings saved.');
    } catch (err) { showToast(err instanceof Error ? err.message : 'Settings could not be saved.'); }
  };
  return <>
    <PageHeader title="Settings" subtitle="Store details, delivery rules and data." />
    <form className="panel form-panel" onSubmit={save} key={JSON.stringify(settings)}>
      <div className="panel-head"><h2>Store details</h2></div>
      <div className="form-grid">
        <label className="field"><span>Store name</span><input name="storeName" required defaultValue={settings.storeName} /></label>
        <label className="field"><span>Support email</span><input name="supportEmail" type="email" required defaultValue={settings.supportEmail} /></label>
        <label className="field"><span>Support phone</span><input name="supportPhone" required defaultValue={settings.supportPhone} /></label>
        <label className="field"><span>Opening hours</span><input name="hours" required defaultValue={settings.hours} /></label>
        <label className="field field-full"><span>Store address</span><input name="address" required defaultValue={settings.address} /></label>
        <label className="field field-full"><span>Announcement bar text</span><input name="announcement" required defaultValue={settings.announcement} /></label>
      </div>
      <div className="panel-head panel-head-spaced"><h2>Delivery and stock</h2></div>
      <div className="form-grid form-grid-3">
        <label className="field"><span>Delivery fee (KES)</span><input name="shippingFee" type="number" min={0} required defaultValue={settings.shippingFee} /></label>
        <label className="field"><span>Free delivery from (KES)</span><input name="freeShippingThreshold" type="number" min={0} required defaultValue={settings.freeShippingThreshold} /></label>
        <label className="field"><span>Low stock level (units)</span><input name="lowStockLevel" type="number" min={0} required defaultValue={settings.lowStockLevel} /></label>
      </div>
      <button type="submit" className="button button-primary button-sm">Save settings</button>
    </form>
    {!remoteMode && <section className="panel form-panel">
      <div className="panel-head"><h2>Demo data</h2></div>
      <p className="panel-text">All products, orders, customers and messages are stored in this browser. Restoring the demo data removes any changes you have made and returns the store to its original state.</p>
      <button className="button button-secondary button-sm" onClick={() => setConfirming(true)}><RotateCcw size={16} /> Restore demo data</button>
    </section>}
    {!remoteMode && confirming && <Modal title="Restore demo data" onClose={() => setConfirming(false)}><p className="confirm-text">This replaces all products, orders, customers, messages and settings with the original demo data. Accounts created through registration will be removed.</p><div className="modal-actions"><button className="button button-secondary button-sm" onClick={() => setConfirming(false)}>Cancel</button><button className="button button-danger button-sm" onClick={() => { resetAllStores(); setConfirming(false); showToast('Demo data restored.'); }}>Restore data</button></div></Modal>}
  </>;
}
