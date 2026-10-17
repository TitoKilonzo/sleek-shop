import { migrate, db } from './client.js';

await migrate();
console.log('Database schema is up to date.');
db.close();
