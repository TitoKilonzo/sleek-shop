import { db } from './client.js';
import { seedDatabase } from './seeder.js';

/**
 * Loads the demo catalogue and, unless --catalogue-only is passed, the demo accounts and activity.
 *   npm run db:seed                       demo data (skips if products already exist)
 *   npm run db:seed -- --force            wipe and reload the demo data
 *   npm run db:seed -- --catalogue-only   products and settings only (use for production)
 * The demo password is read from DEMO_PASSWORD and defaults to the documented demo value.
 */
const args = new Set(process.argv.slice(2));
console.log(await seedDatabase({ force: args.has('--force'), catalogueOnly: args.has('--catalogue-only'), demoPassword: process.env.DEMO_PASSWORD }));
db.close();
