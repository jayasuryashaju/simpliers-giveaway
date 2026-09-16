import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "Is Simpliers just a giveaway tool?",
      a: "Simpliers is an all-in-one social media growth and engagement platform designed to turn interactions into measurable results. While we first became known for our reliable and transparent giveaway tools, our product ecosystem also includes Simpliers CHAT DM automations, verifiable validity certificate registry, and online random selection utilities."
    },
    {
      q: "How does Simpliers guarantee fair and transparent results?",
      a: "Every giveaway draw conducted through Simpliers uses cryptographically secure random number generators (secrets.SystemRandom) and produces a permanent SHA-256 Verifiable Validity Certificate. Anyone can look up the certificate code (e.g. #SMP-772910) to inspect the exact rules applied, participants pool, and timestamp."
    },
    {
      q: "Do I need to enter my social media password or login credentials?",
      a: "Never! Simpliers will NEVER ask for your Instagram, X, or YouTube passwords. You simply provide the public post link, and our system extracts eligible comments directly through public data APIs without ever touching your account security."
    },
    {
      q: "What rule filters can I enforce during winner selection?",
      a: "You can specify minimum tagged friend mentions (@mentions), filter by required keywords or hashtags, automatically count each user once (anti-bot deduplication), and designate backup substitute winners in case the primary winner fails verification."
    },
    {
      q: "Are Simpliers services free to use?",
      a: "Yes! All core Simpliers tools and raffle pickers can be used for free with no credit card required. For accounts running massive campaigns with over 10,000 to 100,000+ comments, upgraded plans and one-time packages provide accelerated scanning and custom branding."
    }
  ];

  return (
    <section id="faq" style={{ padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            <HelpCircle size={14} /> Frequently Asked Questions
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
            Everything You Need to Know
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Learn why millions of creators, agencies, and businesses trust Simpliers for transparent contests.
          </p>
        </div>

        {/* Accordions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${isOpen ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0,
                      color: isOpen ? 'var(--color-primary)' : 'var(--text-muted)'
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 20px 20px',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '16px'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
