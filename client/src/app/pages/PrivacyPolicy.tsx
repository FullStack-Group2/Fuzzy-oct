// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: s4010989

import { useEffect, useMemo, useState } from 'react';
import Toc, { TocItem } from '../../components/TableOfContent';
import HeroBanner from '@/components/HeroBanner';
import kitchen from '@/assets/icon/kitchen.jpg';

type Section = {
  id: string;
  title: string;
  body: JSX.Element;
};

export default function PrivacyPolicy() {
  const sections: Section[] = useMemo(
    () => [
      {
        id: 'collecting-personal-information',
        title: 'Collecting Personal Information',
        body: (
          <>
            <p className="mb-4">
              This Privacy Policy describes how we collect, use, and disclose
              your personal information when you visit our site or make a
              purchase. “Personal Information” means any information that
              identifies, relates to, or could reasonably be linked to an
              individual.
            </p>
            <p className="mb-4">
              We collect information you provide directly (e.g., account
              details, support messages) and information gathered automatically
              (e.g., device data and usage). Details appear in the sections
              below.
            </p>
          </>
        ),
      },
      {
        id: 'device-information',
        title: 'Device Information',
        body: (
          <>
            <p className="mb-4">
              When you visit the site, our systems automatically receive certain
              data from your browser or device to operate and secure the
              service. This may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                IP address, browser type/version, time zone, language, and
                referrer.
              </li>
              <li>
                Cookies or similar identifiers to enable session management and
                analytics.
              </li>
              <li>
                Usage data such as pages viewed, clicks, and time on page to
                improve performance and detect abuse.
              </li>
            </ul>
            <p className="mb-4">
              We process this data to load the site correctly, guard against
              fraud, and understand how visitors use our features. Where
              required, we obtain consent for analytics cookies.
            </p>
          </>
        ),
      },
      {
        id: 'order-information',
        title: 'Order Information',
        body: (
          <>
            <p className="mb-4">
              If you make a purchase, we collect information necessary to
              fulfill the order, such as your name, shipping address, contact
              details, items purchased, and payment‑related information from our
              payment provider (we do not store full card numbers on our
              servers).
            </p>
            <p className="mb-2 font-medium">How we use it:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                To process payments, provide invoices/receipts, and ship items.
              </li>
              <li>To communicate about your order, delivery, and returns.</li>
              <li>
                To prevent fraud and comply with legal/record‑keeping
                obligations.
              </li>
            </ul>
          </>
        ),
      },
      {
        id: 'sharing-personal-information',
        title: 'Sharing Personal Information',
        body: (
          <>
            <p className="mb-4">
              We share personal information with service providers who perform
              functions on our behalf (e.g., cloud hosting, analytics, payment
              processing, shipping). These partners may only use your data per
              our instructions and applicable law.
            </p>
            <p className="mb-4">
              We may disclose information to comply with the law, respond to
              lawful requests, or protect our rights. We do not sell your
              personal information.
            </p>
          </>
        ),
      },
      {
        id: 'your-rights',
        title: 'Your Rights & Choices',
        body: (
          <>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                Access, correction, or deletion of your personal information.
              </li>
              <li>Opt‑out of marketing emails via the unsubscribe link.</li>
              <li>
                Control cookies through your browser settings and our cookie
                banner.
              </li>
            </ul>
            <p className="mb-4">
              To exercise a right, contact us at{' '}
              <span className="underline">privacy@fuzzy.example</span>.
            </p>
          </>
        ),
      },
      {
        id: 'data-retention-security',
        title: 'Data Retention & Security',
        body: (
          <>
            <p className="mb-4">
              We retain personal information only as long as necessary for the
              purposes above or as required by law. We use reasonable
              administrative, technical, and physical safeguards to protect your
              data; no method is 100% secure.
            </p>
          </>
        ),
      },
      {
        id: 'contact',
        title: 'Contact Us',
        body: (
          <>
            <p>
              Questions? Contact:{' '}
              <span className="underline">privacy@fuzzy.example</span>.
            </p>
          </>
        ),
      },
    ],
    [],
  );

  const toc: TocItem[] = useMemo(
    () => sections.map((s) => ({ id: s.id, label: s.title })),
    [sections],
  );

  // Scroll spy
  const [active, setActive] = useState<string | null>(sections[0].id);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 1] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  return (
    <>
      <HeroBanner image={kitchen} title="Shop Page" subtitle="" />

      <main className="min-h-screen">
        {/* BODY */}
        <section className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10">
          {/* Left TOC */}
          <div className="order-2 md:order-1">
            <Toc items={toc} activeId={active} onClick={setActive} />
          </div>

          {/* Content */}
          <article className="prose prose-neutral max-w-none order-1 md:order-2">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                  {s.title}
                </h2>
                <div className="text-neutral-700 leading-relaxed">{s.body}</div>
              </section>
            ))}
          </article>
        </section>
      </main>
    </>
  );
}
