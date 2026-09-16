import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Trophy, 
  Award,
  Flame,
  Users
} from 'lucide-react';
import { InstagramIcon } from './SocialIcons';

export default function Hero({ onOpenGiveaway, onOpenVerify, onSelectPlatform }) {
  const [quickCode, setQuickCode] = useState('');

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (quickCode.trim()) {
      onOpenVerify(quickCode.trim());
    }
  };

  return (
    <section style={{
      position: 'relative',
      padding: '70px 0 60px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 50% -20%, rgba(224, 0, 59, 0.15) 0%, transparent 60%)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          {/* Left Column: Headline, Subtitle, CTAs, Code Lookup */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <span className="badge badge-primary">
                <Flame size={12} /> The #1 Most Trusted Giveaway Platform
              </span>
              <span className="badge badge-success">
                <ShieldCheck size={12} /> 100% Transparent
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-1px',
              marginBottom: '20px'
            }}>
              Giveaway running <br />
              <span className="gradient-text-primary">made simple</span>
            </h1>

            <p style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '520px'
            }}>
              Pick winners fairly from Instagram comments, X retweets, YouTube, Facebook, and custom lists.
              Filter rules, enforce tag counts, and generate verifiable cryptographic validity certificates.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', marginBottom: '24px' }}>
              <button
                onClick={() => onOpenGiveaway('instagram')}
                className="btn btn-primary btn-lg"
              >
                <InstagramIcon size={20} />
                <span>Try Instagram Giveaway</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => onOpenGiveaway('list')}
                className="btn btn-outline btn-lg"
              >
                <Trophy size={18} color="var(--color-gold)" />
                <span>Random List Picker</span>
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={14} color="var(--color-success)" /> No login or password required
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={14} color="var(--color-success)" /> Anti-bot deduplication
              </span>
            </div>

            {/* Quick Certificate Lookup Bar */}
            <form onSubmit={handleQuickVerify} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '6px 8px 6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              maxWidth: '460px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Verify by Certificate Code (e.g. SMP-772910)"
                value={quickCode}
                onChange={(e) => setQuickCode(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  outline: 'none',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  flex: 1
                }}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Verify
              </button>
            </form>
          </div>

          {/* Right Column: Interactive Certificate Preview Showcase Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: '-15px',
              background: 'radial-gradient(circle, rgba(224, 0, 59, 0.25) 0%, transparent 70%)',
              filter: 'blur(30px)',
              zIndex: 0
            }} />

            <div className="simpliers-card" style={{
              position: 'relative',
              zIndex: 1,
              padding: '32px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {/* Header of card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(224, 0, 59, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)'
                  }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                      Verified Validity Certificate
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      #SMP-772910 <CheckCircle2 size={16} color="var(--color-success)" />
                    </div>
                  </div>
                </div>
                <span className="badge badge-success">Permanent Record</span>
              </div>

              {/* Contest Subject preview */}
              <div style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                marginBottom: '20px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <InstagramIcon size={16} color="#e1306c" />
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Summer Community iPhone 15 Pro Giveaway</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                  <span><Users size={12} style={{ display: 'inline', marginRight: '4px' }} /> 8 Eligible Entries</span>
                  <span>• Rules: Min 2 Mentions, Keyword "love"</span>
                </div>
              </div>

              {/* Winners Spotlight */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={14} /> Official Selected Winners
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--color-gold)',
                        color: '#000',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>1</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>@emma.design</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>"I love this community so much! @olivia @lucas"</div>
                      </div>
                    </div>
                    <span className="badge badge-gold">Winner</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--color-gold)',
                        color: '#000',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>2</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>@marcus_tech</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>"Such a great initiative, love the prizes! @jake @ryan"</div>
                      </div>
                    </div>
                    <span className="badge badge-gold">Winner</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Hash & Verification Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '12px'
              }}>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  SHA256: 4a9f...e18b
                </span>
                <button
                  onClick={() => onOpenVerify('SMP-772910')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  View Full Certificate <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
