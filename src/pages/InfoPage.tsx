import { Link, useParams } from 'react-router-dom';
import { money, useSettings } from '../lib/db';
import { NotFoundPage } from './NotFoundPage';

type Section = { heading: string; body: string[] };

export function InfoPage() {
  const { topic = '' } = useParams();
  const settings = useSettings();
  const pages: Record<string, { title: string; intro: string; sections: Section[] }> = {
    delivery: {
      title: 'Delivery information',
      intro: 'We deliver across Kenya and keep you updated from the moment you order.',
      sections: [
        { heading: 'Delivery fees', body: [`Delivery costs ${money(settings.shippingFee)}. Orders of ${money(settings.freeShippingThreshold)} or more are delivered free of charge.`] },
        { heading: 'Delivery times', body: ['Orders within Nairobi are usually delivered within 1 to 2 working days. Deliveries to other towns take 2 to 5 working days depending on the location.', 'You will receive a call from our team to confirm your order before it is dispatched.'] },
        { heading: 'Payment on delivery', body: ['You pay when your order arrives, either in cash or by M-Pesa. Please have the amount ready when the rider arrives.'] },
        { heading: 'Tracking your order', body: ['Signed in customers can follow the status of every order from the My orders page in their account.'] },
      ],
    },
    returns: {
      title: 'Returns and exchanges',
      intro: 'If something is not right, we will make it right.',
      sections: [
        { heading: 'Exchanges', body: ['Unused items in their original packaging can be exchanged within 7 days of delivery. Please keep your order number ready when you contact us.'] },
        { heading: 'Faulty or incorrect items', body: ['If your item arrives damaged, faulty or different from what you ordered, contact us within 48 hours of delivery and we will arrange a replacement or refund.'] },
        { heading: 'Items that cannot be exchanged', body: ['For hygiene reasons we cannot exchange sunglasses once they have been worn or tried on outside the packaging.'] },
        { heading: 'How to start an exchange', body: [`Email ${settings.supportEmail} or call ${settings.supportPhone} during ${settings.hours.toLowerCase()}.`] },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      intro: 'We collect only the information needed to process your order and support your account.',
      sections: [
        { heading: 'Information we collect', body: ['Your name, email address, phone number and delivery address, together with the details of the orders you place.'] },
        { heading: 'How we use it', body: ['To process and deliver orders, to contact you about your order, to manage your account and, if you subscribe, to send our newsletter.'] },
        { heading: 'Sharing', body: ['We do not sell your information. Delivery details are shared only with the riders who deliver your order.'] },
        { heading: 'Your choices', body: [`You can update your details from your account at any time, or ask us to remove them by contacting ${settings.supportEmail}. You can unsubscribe from the newsletter at any time.`] },
      ],
    },
    terms: {
      title: 'Terms of service',
      intro: 'By placing an order with us you agree to the following terms.',
      sections: [
        { heading: 'Orders', body: ['An order is accepted once our team has confirmed it with you. We may cancel an order if an item is out of stock or the delivery details cannot be verified.'] },
        { heading: 'Prices', body: ['All prices are in Kenyan Shillings. We take care to display accurate prices and may correct errors before confirming an order.'] },
        { heading: 'Payment', body: ['Payment is made on delivery by cash or M-Pesa.'] },
        { heading: 'Contact', body: [`Questions about these terms can be sent to ${settings.supportEmail}.`] },
      ],
    },
  };
  const page = pages[topic];
  if (!page) return <NotFoundPage />;
  return <section className="page-shell section-block info-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><span>{page.title}</span></div>
    <div className="info-layout">
      <aside className="info-nav" aria-label="Help topics">{Object.entries(pages).map(([key, value]) => <Link key={key} to={`/help/${key}`} className={key === topic ? 'is-current' : ''}>{value.title}</Link>)}<Link to="/contact">Contact us</Link></aside>
      <article className="info-content"><span className="eyebrow">HELP AND INFORMATION</span><h1>{page.title}</h1><p className="info-intro">{page.intro}</p>{page.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.body.map((text) => <p key={text}>{text}</p>)}</section>)}</article>
    </div>
  </section>;
}
