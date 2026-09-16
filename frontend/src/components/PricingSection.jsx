import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, Flame } from 'lucide-react';

export default function PricingSection({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('annual');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Ideal for small raffles and casual creator giveaways.',
      priceMonthly: 0,
      priceAnnual: 0,
      badge: null,
      features: [
        'Up to 500 comments per post',
        'Basic duplicate filtering',
        'Random winner & backup draws',
        'Standard certificate generation',
        'Instagram, X & YouTube pickers'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for growing influencers and local brands.',
      priceMonthly: 9.90,
      priceAnnual: 7.90,
      badge: 'Popular for Creators',
      features: [
        'Up to 10,000 comments per draw',
        'Friend mentions verification (1, 2, 3+)',
        'Required keyword & hashtag filter',
        'Verified validity certificate with QR code',
        'Unlimited backup substitute winners',
        'Fast comment scanning speed'
      ],
      cta: 'Choose Starter',
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'For agencies, e-commerce stores & major campaigns.',
      priceMonthly: 24.90,
      priceAnnual: 19.90,
      badge: 'Most Popular',
      features: [
        'Up to 100,000 comments per draw',
        'Multi-post giveaway merging',
        'Custom brand logo on certificate',
        'Export comment data to Excel/CSV',
        'Instagram DM automation scenario credits',
        '24/7 Priority chat support'
      ],
      cta: 'Start Pro Free Trial',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Enterprise scale for high-volume marketing agencies.',
      priceMonthly: 69.90,
      priceAnnual: 54.90,
      badge: 'Unlimited Power',
      features: [
        'Unlimited comments per giveaway',
        'Unlimited multi-platform combining',
        'White-label branded certificates',
        'Dedicated account manager',
        'REST API & Webhook integrations',
        'Custom contractual SLA'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <section id="pricing" style={{ padding: '80px 0', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            <Zap size={14} /> Transparent Pricing
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Simple, Transparent Plans That Scale
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            No hidden fees. Every plan includes cryptographic random draws and official validity certificates.
          </p>

          {/* Billing Toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: billingCycle === 'monthly' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'monthly' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: billingCycle === 'annual' ? 'var(--color-primary)' : 'transparent',
                color: billingCycle === 'annual' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Annual</span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--color-success)',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          alignItems: 'stretch'
        }}>
          {plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className="simpliers-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: plan.popular ? '2px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                  boxShadow: plan.popular ? '0 12px 40px rgba(224, 0, 59, 0.25)' : 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px'
                  }}>
                    <span className={plan.popular ? 'badge badge-primary' : 'badge'}>
                      {plan.popular && <Flame size={12} style={{ marginRight: '4px' }} />}
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', minHeight: '38px', marginBottom: '20px' }}>
                    {plan.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                    <span style={{ fontSize: '38px', fontWeight: 900 }}>
                      ${price.toFixed(price === 0 ? 0 : 2)}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {price === 0 ? '' : '/ month'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                    {plan.features.map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
                        <Check size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ color: 'var(--text-main)' }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
                  style={{ width: '100%', padding: '12px' }}
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
