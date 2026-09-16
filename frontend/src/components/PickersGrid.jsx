import React from 'react';
import { 
  Layers, 
  ListOrdered, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { InstagramIcon, TwitterIcon, YoutubeIcon, FacebookIcon } from './SocialIcons';

export default function PickersGrid({ onSelectPlatform }) {
  const pickers = [
    {
      id: 'instagram',
      title: 'Instagram Giveaway Picker',
      description: 'Collect all comments, track likes, enforce mention counts, and announce winners with verified certificate.',
      icon: InstagramIcon,
      iconColor: '#e1306c',
      bgColor: 'rgba(225, 48, 108, 0.08)',
      borderColor: 'rgba(225, 48, 108, 0.2)',
      features: ['All comments & replies', 'Min. mentions filter', 'Duplicate detection', 'Certificate ID'],
      badge: 'Most Popular'
    },
    {
      id: 'twitter',
      title: 'X (Twitter) Giveaway Picker',
      description: 'Pick winners from retweets, quote tweets, replies, and follower requirements automatically.',
      icon: TwitterIcon,
      iconColor: 'var(--text-main)',
      bgColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      features: ['Retweets & Quotes', 'Hashtag requirements', 'Instant deduplication', 'Verifiable hash'],
      badge: 'Fast Draw'
    },
    {
      id: 'youtube',
      title: 'YouTube Giveaway Picker',
      description: 'Extract all top-level comments and replies from YouTube videos and live streams fairly.',
      icon: YoutubeIcon,
      iconColor: '#ff0000',
      bgColor: 'rgba(255, 0, 0, 0.08)',
      borderColor: 'rgba(255, 0, 0, 0.2)',
      features: ['Video comment extractor', 'Timestamp filtering', 'Subscriber bonus', 'Official certificate'],
      badge: 'HD Video'
    },
    {
      id: 'facebook',
      title: 'Facebook Giveaway Picker',
      description: 'Select winners fairly from Facebook business page posts, reels, and contest announcements.',
      icon: FacebookIcon,
      iconColor: '#1877f2',
      bgColor: 'rgba(24, 119, 242, 0.08)',
      borderColor: 'rgba(24, 119, 242, 0.2)',
      features: ['Page post comments', 'Keyword requirements', 'Unlimited entries', 'Audit trail'],
      badge: 'Business'
    },
    {
      id: 'multi',
      title: 'Multi-Post Giveaway Picker',
      description: 'Combine entries across Instagram, X, YouTube, and Facebook into a single unified raffle pool.',
      icon: Layers,
      iconColor: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.08)',
      borderColor: 'rgba(168, 85, 247, 0.2)',
      features: ['Cross-platform merge', 'Weighted entries', 'Automated deduplication', 'Single certificate'],
      badge: 'Omnichannel'
    },
    {
      id: 'list',
      title: 'Online List Randomizer',
      description: 'Paste any custom list of names, numbers, or ticket entries. Pick winners and alternates instantly.',
      icon: ListOrdered,
      iconColor: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      features: ['Custom list paste', 'Custom brand colors', 'Alternate winners', 'Instant share link'],
      badge: 'Free Instant'
    }
  ];

  return (
    <section style={{ padding: '60px 0 80px' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            <Sparkles size={14} /> Giveaway Pickers
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Choose Your Giveaway Platform
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
            Select any social network or paste custom lists to begin your transparent and verifiable contest.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {pickers.map((picker) => {
            const Icon = picker.icon;
            return (
              <div
                key={picker.id}
                className="simpliers-card"
                onClick={() => onSelectPlatform(picker.id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: `1px solid ${picker.borderColor}`,
                  background: `linear-gradient(180deg, ${picker.bgColor} 0%, var(--bg-card) 60%)`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: picker.bgColor,
                      border: `1px solid ${picker.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: picker.iconColor
                    }}>
                      <Icon size={26} />
                    </div>
                    <span className="badge" style={{
                      background: picker.bgColor,
                      color: picker.iconColor,
                      border: `1px solid ${picker.borderColor}`
                    }}>
                      {picker.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                    {picker.title}
                  </h3>

                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                    {picker.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                    {picker.features.map((feat, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <Check size={13} color="var(--color-success)" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: picker.iconColor
                }}>
                  <span>Run {picker.title.split(' ')[0]} Draw</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
