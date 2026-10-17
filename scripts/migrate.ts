import { migrate, db } from '../server/db/client.js';

await migrate();
console.log('Database schema is up to date.');
db.close();
