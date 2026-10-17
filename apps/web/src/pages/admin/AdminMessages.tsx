import { Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Modal, PageHeader } from '../../components/Console';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../lib/format';
import { deleteMessage, markMessageRead, removeSubscriber, useMessages, useSubscribers } from '../../lib/db';

export function AdminMessages() {
  const messages = useMessages();
  const subscribers = useSubscribers();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'messages' | 'subscribers'>('messages');
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = messages.find((message) => message.id === openId) ?? null;
  const open = (id: string) => { setOpenId(id); markMessageRead(id).catch(() => undefined); };
  const unread = messages.filter((message) => !message.read).length;

  return <>
    <PageHeader title="Messages" subtitle="Customer enquiries and newsletter subscribers." />
    <section className="panel">
      <div className="tabs" role="tablist"><button role="tab" aria-selected={tab === 'messages'} className={tab === 'messages' ? 'is-active' : ''} onClick={() => setTab('messages')}>Enquiries<b>{unread || messages.length}</b></button><button role="tab" aria-selected={tab === 'subscribers'} className={tab === 'subscribers' ? 'is-active' : ''} onClick={() => setTab('subscribers')}>Subscribers<b>{subscribers.length}</b></button></div>
      {tab === 'messages' ? (messages.length ? <ul className="message-list">{messages.map((message) => <li key={message.id}><button onClick={() => open(message.id)} className={message.read ? '' : 'is-unread'}><i className="unread-dot" /><span className="message-main"><strong>{message.subject}</strong><small>{message.name} · {message.email}</small><span>{message.body}</span></span><time>{formatDateTime(message.createdAt)}</time></button></li>)}</ul> : <div className="panel-empty"><p>There are no messages yet.</p></div>)
        : (subscribers.length ? <div className="table-wrap"><table className="data-table"><thead><tr><th>Email address</th><th>Subscribed</th><th className="col-actions">Remove</th></tr></thead><tbody>{subscribers.map((subscriber) => <tr key={subscriber.email}><td>{subscriber.email}</td><td>{formatDateTime(subscriber.createdAt)}</td><td className="col-actions"><button className="icon-button icon-danger" aria-label={`Remove ${subscriber.email}`} onClick={async () => { try { await removeSubscriber(subscriber.email); showToast('Subscriber removed.'); } catch (err) { showToast(err instanceof Error ? err.message : 'Could not remove the subscriber.'); } }}><Trash2 size={17} /></button></td></tr>)}</tbody></table></div> : <div className="panel-empty"><p>There are no subscribers yet.</p></div>)}
    </section>
    {selected && <Modal title={selected.subject} onClose={() => setOpenId(null)}>
      <div className="message-view"><p className="message-from"><strong>{selected.name}</strong> · {selected.email}<br /><small>{formatDateTime(selected.createdAt)}</small></p><p className="message-body">{selected.body}</p></div>
      <div className="modal-actions"><button className="button button-secondary button-sm" onClick={async () => { try { await deleteMessage(selected.id); setOpenId(null); showToast('Message deleted.'); } catch (err) { showToast(err instanceof Error ? err.message : 'Could not delete the message.'); } }}><Trash2 size={15} /> Delete</button><a className="button button-primary button-sm" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject}`)}`}><Mail size={15} /> Reply by email</a></div>
    </Modal>}
  </>;
}
