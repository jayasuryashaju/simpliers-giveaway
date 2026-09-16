import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  Layers, 
  Search, 
  Wand2, 
  Dice6, 
  CircleDot, 
  ListOrdered, 
  Hash, 
  Sun, 
  Moon, 
  ChevronDown, 
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { InstagramIcon, TwitterIcon, YoutubeIcon, FacebookIcon } from './SocialIcons';

export default function Navbar({ onOpenGiveaway, onOpenVerify, onOpenTool, activeTheme, toggleTheme }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.nav-item-dropdown')) {
        setActiveDropdown(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--bg-nav)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'background-color var(--transition-normal)'
    }}>
      {/* Top micro bar */}
      <div style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '6px 0',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600 }}>
              <ShieldCheck size={14} /> Official Simpliers Clone
            </span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>100% Verifiable & Cryptographically Fair Results</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={() => onOpenVerify()}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              <Search size={12} /> Search by Certificate Code
            </button>
            <span style={{ opacity: 0.5 }}>|</span>
            <a href="#prices" style={{ color: 'inherit', textDecoration: 'none' }}>Prices</a>
            <span style={{ opacity: 0.5 }}>|</span>
            <a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        paddingBottom: '12px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #ff2b55 100%)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(224, 0, 59, 0.4)'
          }}>
            <Gift size={22} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.5px'
            }}>
              simpliers
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, rgba(224,0,59,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)'
            }}>
              Giveaway
            </span>
          </div>
        </div>

        {/* Desktop Navigation links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Do Giveaway Mega Menu */}
          <div className="nav-item-dropdown" style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'giveaway' ? null : 'giveaway');
              }}
              className="btn btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                color: activeDropdown === 'giveaway' ? 'var(--color-primary)' : 'var(--text-main)'
              }}
            >
              <span>Do Giveaway</span>
              <ChevronDown size={15} style={{
                transform: activeDropdown === 'giveaway' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />
            </button>

            {activeDropdown === 'giveaway' && (
              <div className="mega-dropdown" style={{ width: '600px', left: 0, transform: 'none' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Social Media Pickers
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => { onOpenGiveaway('instagram'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(225, 48, 108, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#e1306c'
                      }}>
                        <InstagramIcon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Instagram Giveaway</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From comments, likes & tags</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onOpenGiveaway('twitter'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-main)'
                      }}>
                        <TwitterIcon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>X (Twitter) Giveaway</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From retweets, replies & quotes</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onOpenGiveaway('youtube'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(255, 0, 0, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ff0000'
                      }}>
                        <YoutubeIcon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>YouTube Giveaway</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From video comments</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onOpenGiveaway('facebook'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(24, 119, 242, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1877f2'
                      }}>
                        <FacebookIcon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Facebook Giveaway</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>From post comments</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Multi-Platform & Tools
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => { onOpenGiveaway('multi'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(67, 45, 215, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#432dd7'
                      }}>
                        <Layers size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Multi-Post Giveaway</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Combine multiple posts into one</div>
                      </div>
                    </button>

                    <a
                      href="/en/games/list"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f59e0b'
                      }}>
                        <ListOrdered size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Online Random Selector</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Paste any list of names or items</div>
                      </div>
                    </a>

                    <button
                      onClick={() => { onOpenVerify(); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        marginTop: '8px'
                      }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981'
                      }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#10b981' }}>Verify Certificate</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Query permanent validity record</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tools & Games Dropdown */}
          <div className="nav-item-dropdown" style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'tools' ? null : 'tools');
              }}
              className="btn btn-ghost"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600,
                color: activeDropdown === 'tools' ? 'var(--color-primary)' : 'var(--text-main)'
              }}
            >
              <span>Tools & Games</span>
              <ChevronDown size={15} style={{
                transform: activeDropdown === 'tools' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} />
            </button>

            {activeDropdown === 'tools' && (
              <div className="mega-dropdown" style={{ width: '560px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Interactive Mini-Games
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => { onOpenTool('wheel'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <CircleDot size={20} color="#f59e0b" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Spin the Wheel</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Decide prizes with wheel spin</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onOpenTool('coin'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Sparkles size={20} color="#10b981" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Flip a Coin</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Heads or Tails 3D simulator</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onOpenTool('dice'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Dice6 size={20} color="#3b82f6" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Roll Virtual Dice</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Roll 1-6 dice with sum totals</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Utilities & Social Tools
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button
                      onClick={() => { onOpenTool('caption'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Wand2 size={20} color="#a855f7" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Caption Generator</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Generate viral contest copy</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onOpenTool('numbers'); setActiveDropdown(null); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Hash size={20} color="#e0003b" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Random Numbers</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cryptographic number draws</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <a href="#pricing" className="btn btn-ghost" style={{ fontWeight: 600, textDecoration: 'none' }}>
            Prices
          </a>
          <a href="#faq" className="btn btn-ghost" style={{ fontWeight: 600, textDecoration: 'none' }}>
            Support
          </a>
        </nav>

        {/* Right side controls (Theme switch, Search, Launch CTA) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {activeTheme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* Quick certificate lookup icon button */}
          <button
            onClick={() => onOpenVerify()}
            className="btn btn-outline btn-sm"
            style={{ display: 'none', gap: '6px' }}
            title="Search by Certificate Code"
          >
            <Search size={14} /> Verify
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => onOpenGiveaway('instagram')}
            className="btn btn-primary"
            style={{ fontSize: '14px', padding: '10px 20px' }}
          >
            <Gift size={16} />
            <span>Launch Giveaway</span>
          </button>
        </div>
      </div>
    </header>
  );
}
