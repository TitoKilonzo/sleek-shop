import { seedProducts } from './catalog.js';
import type { Message, Order, OrderItem, OrderStatus, PaymentMethod, Settings, Subscriber, User } from './types.js';

const DAY = 86400000;
const iso = (daysAgo: number, hour = 10, minute = 0) => {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const defaultSettings: Settings = {
  storeName: 'Sleek Shop',
  supportEmail: 'support@sleekshop.com',
  supportPhone: '+254 700 000 000',
  address: 'Westlands, Nairobi, Kenya',
  hours: 'Monday to Saturday, 8:00 am to 6:00 pm',
  shippingFee: 350,
  freeShippingThreshold: 7500,
  lowStockLevel: 10,
  announcement: 'Free delivery on orders over KES 7,500',
};

/**
 * Demo accounts. Credentials are stored only as hashes and are never shown in the interface.
 * Sign in emails are not case sensitive.
 */
export const seedUsers = (): User[] => [
  { id: 'u-admin', name: 'Daniel Otieno', email: 'admin@sleekshop.com', phone: '+254 711 200 301', role: 'admin', hash: 'ljjnd6xwe7', address: 'Westlands', city: 'Nairobi', active: true, createdAt: iso(210) },
  { id: 'u-manager', name: 'Faith Njeri', email: 'manager@sleekshop.com', phone: '+254 722 410 118', role: 'manager', hash: 'a3mckqln9', address: 'Kilimani', city: 'Nairobi', active: true, createdAt: iso(180) },
  { id: 'u-c1', name: 'Brian Kamau', email: 'customer@sleekshop.com', phone: '+254 712 555 014', role: 'customer', hash: '1jbm9raushl', address: 'Apartment 4B, Ngong Road', city: 'Nairobi', active: true, createdAt: iso(96) },
  { id: 'u-c2', name: 'Amina Hassan', email: 'amina@sleekshop.com', phone: '+254 733 908 622', role: 'customer', hash: '27h2tb5aqaf', address: 'Nyali Road', city: 'Mombasa', active: true, createdAt: iso(84) },
  { id: 'u-c3', name: 'Peter Ochieng', email: 'peter.ochieng@gmail.com', phone: '+254 700 118 450', role: 'customer', hash: '', address: 'Milimani Estate', city: 'Kisumu', active: true, createdAt: iso(70) },
  { id: 'u-c4', name: 'Lucy Wambui', email: 'lucy.wambui@gmail.com', phone: '+254 721 330 905', role: 'customer', hash: '', address: 'Milton Siding', city: 'Nakuru', active: true, createdAt: iso(61) },
  { id: 'u-c5', name: 'Kevin Mutua', email: 'kevin.mutua@outlook.com', phone: '+254 745 662 081', role: 'customer', hash: '', address: 'Lang\'ata Road', city: 'Nairobi', active: true, createdAt: iso(48) },
  { id: 'u-c6', name: 'Esther Chebet', email: 'esther.chebet@gmail.com', phone: '+254 718 204 773', role: 'customer', hash: '', address: 'Elgon View', city: 'Eldoret', active: true, createdAt: iso(33) },
  { id: 'u-c7', name: 'Samuel Kiprono', email: 'samuel.kiprono@yahoo.com', phone: '+254 704 991 236', role: 'customer', hash: '', address: 'Thika Road', city: 'Nairobi', active: true, createdAt: iso(21) },
  { id: 'u-c8', name: 'Naomi Akinyi', email: 'naomi.akinyi@gmail.com', phone: '+254 729 440 517', role: 'customer', hash: '', address: 'Kondele', city: 'Kisumu', active: true, createdAt: iso(9) },
];

type Plan = [number, string, number, number, Array<[string, number]>, OrderStatus, PaymentMethod];
// [order number, user id, days ago, hour, [product id, quantity][], status, payment]
const plans: Plan[] = [
  [10412, 'u-c1', 0, 9, [['p-003', 1]], 'Pending', 'M-Pesa on delivery'],
  [10411, 'u-c8', 0, 8, [['p-012', 1], ['p-007', 1]], 'Pending', 'Cash on delivery'],
  [10410, 'u-c2', 1, 16, [['p-009', 1], ['p-004', 1]], 'Processing', 'M-Pesa on delivery'],
  [10409, 'u-c5', 1, 11, [['p-005', 1]], 'Processing', 'Cash on delivery'],
  [10408, 'u-c1', 2, 15, [['p-002', 1], ['p-008', 1]], 'Shipped', 'M-Pesa on delivery'],
  [10407, 'u-c7', 3, 13, [['p-011', 2]], 'Shipped', 'Cash on delivery'],
  [10406, 'u-c4', 4, 10, [['p-001', 1]], 'Delivered', 'M-Pesa on delivery'],
  [10405, 'u-c3', 5, 14, [['p-010', 1], ['p-012', 1]], 'Delivered', 'Cash on delivery'],
  [10404, 'u-c6', 6, 9, [['p-006', 2]], 'Delivered', 'M-Pesa on delivery'],
  [10403, 'u-c2', 7, 17, [['p-003', 1], ['p-011', 1]], 'Delivered', 'M-Pesa on delivery'],
  [10402, 'u-c5', 8, 12, [['p-007', 1]], 'Cancelled', 'Cash on delivery'],
  [10401, 'u-c1', 9, 10, [['p-001', 1], ['p-006', 1]], 'Delivered', 'Cash on delivery'],
  [10400, 'u-c7', 10, 15, [['p-004', 1]], 'Delivered', 'M-Pesa on delivery'],
  [10399, 'u-c3', 12, 11, [['p-002', 2]], 'Delivered', 'Cash on delivery'],
  [10398, 'u-c8', 13, 14, [['p-009', 1]], 'Delivered', 'M-Pesa on delivery'],
  [10397, 'u-c4', 15, 9, [['p-005', 1], ['p-008', 1]], 'Delivered', 'M-Pesa on delivery'],
  [10396, 'u-c6', 17, 16, [['p-010', 1]], 'Delivered', 'Cash on delivery'],
  [10395, 'u-c2', 19, 10, [['p-012', 2], ['p-004', 1]], 'Delivered', 'M-Pesa on delivery'],
  [10394, 'u-c1', 22, 13, [['p-007', 1], ['p-011', 1]], 'Delivered', 'Cash on delivery'],
  [10393, 'u-c5', 25, 10, [['p-003', 1]], 'Delivered', 'M-Pesa on delivery'],
  [10392, 'u-c7', 28, 12, [['p-001', 2]], 'Delivered', 'Cash on delivery'],
  [10391, 'u-c3', 31, 15, [['p-006', 1], ['p-009', 1]], 'Delivered', 'Cash on delivery'],
];

export const seedOrders = (): Order[] => {
  const products = seedProducts();
  const users = seedUsers();
  return plans.map(([number, userId, daysAgo, hour, lines, status, payment]) => {
    const user = users.find((item) => item.id === userId)!;
    const items: OrderItem[] = lines.map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId)!;
      return { productId, name: product.name, price: product.price, quantity, image: product.image, imageFallback: product.imageFallback };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= defaultSettings.freeShippingThreshold ? 0 : defaultSettings.shippingFee;
    const created = iso(daysAgo, hour, (number * 7) % 60);
    return {
      id: `SS-${number}`, userId, customerName: user.name, email: user.email, phone: user.phone, address: user.address, city: user.city,
      items, subtotal, shipping, total: subtotal + shipping, status, payment, createdAt: created, updatedAt: created,
    };
  });
};

export const seedMessages = (): Message[] => [
  { id: 'm-1', name: 'Mercy Atieno', email: 'mercy.atieno@gmail.com', subject: 'Delivery to Kisumu', body: 'Hello, how many days does delivery to Kisumu usually take? I would like to order a backpack for my brother.', read: false, createdAt: iso(0, 7, 40) },
  { id: 'm-2', name: 'John Maina', email: 'john.maina@gmail.com', subject: 'Bulk order enquiry', body: 'We are a small office in Thika and would like to buy six laptop sleeves. Do you offer a discount for bulk orders?', read: false, createdAt: iso(1, 12, 5) },
  { id: 'm-3', name: 'Joy Wanjiru', email: 'joy.wanjiru@outlook.com', subject: 'Exchange a pair of trainers', body: 'The trainers I received are a size too small. Can I exchange them for the next size up?', read: true, createdAt: iso(4, 15, 30) },
  { id: 'm-4', name: 'Ali Abdi', email: 'ali.abdi@gmail.com', subject: 'Payment on delivery', body: 'Can I pay with M-Pesa when the rider arrives with my order?', read: true, createdAt: iso(6, 9, 10) },
];

export const seedSubscribers = (): Subscriber[] => [
  { email: 'mercy.atieno@gmail.com', createdAt: iso(14) },
  { email: 'tabitha.n@gmail.com', createdAt: iso(11) },
  { email: 'victor.otieno@outlook.com', createdAt: iso(5) },
];
