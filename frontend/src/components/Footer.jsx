import React from 'react';
import { Gift, ShieldCheck, Heart, Globe } from 'lucide-react';

export default function Footer({ onOpenGiveaway, onOpenVerify, onOpenTool }) {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '60px 0 30px',
      color: 'var(--text-secondary)',
      fontSize: '14px'
    }}>
      <div className="container">
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Brand Column */}
          <div style={{ maxWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #ff2b55 100%)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Gift size={18} />
              </div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
                simpliers
              </span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '16px' }}>
              The most trusted and transparent platform for social media giveaways, random winner selection, and verified certificate generation.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
              <ShieldCheck size={16} /> 100% Verifiable & Cryptographic
            </div>
          </div>

          {/* Giveaway Pickers */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', fontSize: '15px' }}>
              Giveaway Pickers
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button onClick={() => onOpenGiveaway('instagram')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  Instagram Giveaway
                </button>
              </li>
              <li>
                <button onClick={() => onOpenGiveaway('twitter')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  X (Twitter) Giveaway
                </button>
              </li>
              <li>
                <button onClick={() => onOpenGiveaway('youtube')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  YouTube Giveaway
                </button>
              </li>
              <li>
                <button onClick={() => onOpenGiveaway('facebook')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  Facebook Giveaway
                </button>
              </li>
              <li>
                <button onClick={() => onOpenGiveaway('multi')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  Multi-Post Giveaway
                </button>
              </li>
            </ul>
          </div>

          {/* Free Tools & Games */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', fontSize: '15px' }}>
              Tools & Games
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button onClick={() => onOpenTool('wheel')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  Spin the Wheel
                </button>
              </li>
              <li>
                <button onClick={() => onOpenTool('coin')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  Flip a Coin
                </button>
              </li>
              <li>
                <button onClick={() => onOpenTool('dice')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  Roll Virtual Dice
                </button>
              </li>
              <li>
                <button onClick={() => onOpenTool('numbers')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  Random Number Generator
                </button>
              </li>
              <li>
                <button onClick={() => onOpenTool('caption')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit' }}>
                  Giveaway Caption Generator
                </button>
              </li>
            </ul>
          </div>

          {/* Verification & Trust */}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', fontSize: '15px' }}>
              Authenticity
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button onClick={() => onOpenVerify()} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', font: 'inherit', fontWeight: 600 }}>
                  Search by Certificate Code
                </button>
              </li>
              <li><a href="#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing Plans</a></li>
              <li><a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ & Rules</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>API & Developers</a></li>
              <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy & Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Simpliers Clone. All rights reserved. Built for fair & transparent raffles.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={14} /> English (US)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
