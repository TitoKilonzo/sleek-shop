import { hashPassword, newId } from '../lib/security.js';
import { db, migrate } from './client.js';

/** Usage: npm run admin:create -- <email> "<Full Name>" <password> [admin|manager] */
const [email, name, password, role = 'admin'] = process.argv.slice(2);
if (!email || !name || !password) {
  console.error('Usage: npm run admin:create -- <email> "<Full Name>" <password> [admin|manager]');
  process.exit(1);
}
if (!/^\S+@\S+\.\S+$/.test(email)) { console.error('Enter a valid email address.'); process.exit(1); }
if (password.length < 10) { console.error('Use a password of at least 10 characters.'); process.exit(1); }
if (role !== 'admin' && role !== 'manager') { console.error('Role must be admin or manager.'); process.exit(1); }

await migrate();
const hash = await hashPassword(password);
const found = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email.toLowerCase()] });
if (found.rows[0]) {
  await db.execute({ sql: 'UPDATE users SET name = ?, role = ?, password_hash = ?, active = 1 WHERE id = ?', args: [name, role, hash, String(found.rows[0].id)] });
  console.log(`Updated ${role} account ${email}.`);
} else {
  await db.execute({ sql: "INSERT INTO users (id, name, email, phone, role, password_hash, address, city, active, created_at) VALUES (?, ?, ?, '', ?, ?, '', '', 1, ?)", args: [newId('u'), name, email.toLowerCase(), role, hash, new Date().toISOString()] });
  console.log(`Created ${role} account ${email}.`);
}
db.close();
