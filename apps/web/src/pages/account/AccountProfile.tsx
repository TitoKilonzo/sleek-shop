import { useState, type FormEvent } from 'react';
import { PageHeader } from '../../components/Console';
import { useToast } from '../../context/ToastContext';
import { changePassword, updateProfile, useAuth } from '../../lib/db';

export function AccountProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [passwordError, setPasswordError] = useState('');
  if (!user) return null;

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '').trim();
    try {
      await updateProfile(user.id, { name: text('name'), phone: text('phone'), address: text('address'), city: text('city') });
      showToast('Your details have been updated.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Your details could not be updated.'); }
  };
  const savePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const next = String(form.get('next') ?? '');
    if (next !== String(form.get('confirm') ?? '')) { setPasswordError('The new passwords do not match.'); return; }
    const result = await changePassword(user.id, String(form.get('current') ?? ''), next);
    if (!result.ok) { setPasswordError(result.error ?? 'Could not update your password.'); return; }
    setPasswordError('');
    formElement.reset();
    showToast('Your password has been changed.');
  };

  return <>
    <PageHeader title="Profile" subtitle="Manage your personal details and password." />
    <div className="two-col">
      <form className="panel form-panel" onSubmit={saveProfile} key={user.id + user.name}>
        <div className="panel-head"><h2>Personal details</h2></div>
        <div className="form-grid">
          <label className="field field-full"><span>Full name</span><input name="name" required minLength={2} defaultValue={user.name} /></label>
          <label className="field"><span>Email address</span><input value={user.email} readOnly disabled /></label>
          <label className="field"><span>Phone number</span><input name="phone" type="tel" required defaultValue={user.phone} /></label>
          <label className="field field-full"><span>Delivery address</span><input name="address" defaultValue={user.address} placeholder="Building, street or estate" /></label>
          <label className="field"><span>Town or city</span><input name="city" defaultValue={user.city} placeholder="Nairobi" /></label>
        </div>
        <button type="submit" className="button button-primary button-sm">Save changes</button>
      </form>
      <form className="panel form-panel" onSubmit={savePassword}>
        <div className="panel-head"><h2>Change password</h2></div>
        <div className="form-grid">
          <label className="field field-full"><span>Current password</span><input name="current" type="password" autoComplete="current-password" required /></label>
          <label className="field field-full"><span>New password</span><input name="next" type="password" autoComplete="new-password" required minLength={8} /></label>
          <label className="field field-full"><span>Confirm new password</span><input name="confirm" type="password" autoComplete="new-password" required minLength={8} /></label>
        </div>
        {passwordError && <div className="form-error" role="alert">{passwordError}</div>}
        <button type="submit" className="button button-primary button-sm">Update password</button>
      </form>
    </div>
  </>;
}
