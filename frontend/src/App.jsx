import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PickersGrid from './components/PickersGrid';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import GiveawayModal from './components/GiveawayModal';
import VerifyCertificateModal from './components/VerifyCertificateModal';
import ToolsModal from './components/ToolsModal';
import { Sparkles, CircleDot, Dice6, Wand2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('simpliers-theme') || 'dark';
  });

  // Modal States
  const [giveawayModal, setGiveawayModal] = useState({ isOpen: false, platform: 'instagram' });
  const [verifyModal, setVerifyModal] = useState({ isOpen: false, code: '' });
  const [toolsModal, setToolsModal] = useState({ isOpen: false, tool: 'wheel' });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('simpliers-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOpenGiveaway = (platform = 'instagram') => {
    setGiveawayModal({ isOpen: true, platform });
  };

  const handleOpenVerify = (code = '') => {
    setVerifyModal({ isOpen: true, code });
  };

  const handleOpenTool = (tool = 'wheel') => {
    setToolsModal({ isOpen: true, tool });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Navbar
        onOpenGiveaway={handleOpenGiveaway}
        onOpenVerify={handleOpenVerify}
        onOpenTool={handleOpenTool}
        activeTheme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <Hero
          onOpenGiveaway={handleOpenGiveaway}
          onOpenVerify={handleOpenVerify}
          onSelectPlatform={handleOpenGiveaway}
        />

        {/* Social Giveaway Pickers Grid */}
        <PickersGrid onSelectPlatform={handleOpenGiveaway} />

        {/* Interactive Free Tools Banner */}
        <section style={{
          padding: '40px 0',
          background: 'linear-gradient(135deg, rgba(224, 0, 59, 0.08) 0%, rgba(67, 45, 215, 0.08) 100%)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-gold)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', marginBottom: '4px' }}>
                <Sparkles size={16} /> Quick Utilities
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800 }}>Explore Free Interactive Tools & Games</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Spin the lucky wheel, flip 3D coins, roll dice, or write high-converting giveaway captions in seconds.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button onClick={() => handleOpenTool('wheel')} className="btn btn-outline btn-sm">
                <CircleDot size={15} color="#f59e0b" /> Spin the Wheel
              </button>
              <button onClick={() => handleOpenTool('coin')} className="btn btn-outline btn-sm">
                <Sparkles size={15} color="#10b981" /> Flip a Coin
              </button>
              <button onClick={() => handleOpenTool('dice')} className="btn btn-outline btn-sm">
                <Dice6 size={15} color="#3b82f6" /> Roll Dice
              </button>
              <button onClick={() => handleOpenTool('caption')} className="btn btn-primary btn-sm">
                <Wand2 size={15} /> Caption Generator
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <PricingSection onSelectPlan={() => handleOpenGiveaway('instagram')} />

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenGiveaway={handleOpenGiveaway}
        onOpenVerify={handleOpenVerify}
        onOpenTool={handleOpenTool}
      />

      {/* Interactive Modals */}
      <GiveawayModal
        isOpen={giveawayModal.isOpen}
        initialPlatform={giveawayModal.platform}
        onClose={() => setGiveawayModal({ isOpen: false, platform: 'instagram' })}
        onOpenVerify={handleOpenVerify}
      />

      <VerifyCertificateModal
        isOpen={verifyModal.isOpen}
        initialCode={verifyModal.code}
        onClose={() => setVerifyModal({ isOpen: false, code: '' })}
      />

      <ToolsModal
        isOpen={toolsModal.isOpen}
        initialTool={toolsModal.tool}
        onClose={() => setToolsModal({ isOpen: false, tool: 'wheel' })}
      />
    </div>
  );
}
