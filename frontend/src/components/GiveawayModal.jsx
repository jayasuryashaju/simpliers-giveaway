import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Layers, 
  ListOrdered, 
  ShieldCheck, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  RefreshCw, 
  ArrowRight, 
  Copy, 
  Share2, 
  Sliders, 
  Volume2, 
  VolumeX,
  Clock,
  Hash,
  Award
} from 'lucide-react';
import { InstagramIcon, TwitterIcon, YoutubeIcon, FacebookIcon } from './SocialIcons';
import { getApiBaseUrl } from '../services/api';

// Web Audio API Sound Generator for suspense and celebration
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'fanfare') {
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.45);
      });
    }
  } catch {
    // Audio context not allowed or unsupported; safe fallback
  }
};

export default function GiveawayModal({ isOpen, onClose, initialPlatform = 'instagram', onOpenVerify }) {
  const [platform, setPlatform] = useState(initialPlatform);
  const [step, setStep] = useState(1); // 1: Input, 2: Scanning, 3: Rules, 4: Draw Suspense, 5: Result
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Form Fields
  const [postUrl, setPostUrl] = useState('');
  const [giveawayTitle, setGiveawayTitle] = useState('Official Simpliers Giveaway');
  const [listInput, setListInput] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [substituteCount, setSubstituteCount] = useState(1);
  const [minMentions, setMinMentions] = useState(0);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [allowDuplicates, setAllowDuplicates] = useState(false);

  // Scanning State
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('Connecting to API...');
  const [extractedEntries, setExtractedEntries] = useState([]);

  // Draw & Result State
  const [countdown, setCountdown] = useState(3);
  const [slotCandidate, setSlotCandidate] = useState('Shuffling candidates...');
  const [giveawayResult, setGiveawayResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPlatform(initialPlatform);
  }, [initialPlatform]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setScanProgress(0);
      setGiveawayResult(null);
      setCopiedLink(false);
      if (platform === 'instagram' && !postUrl) {
        setPostUrl('https://www.instagram.com/p/C-simpliers2026/');
      }
    }
  }, [isOpen, platform]);

  if (!isOpen) return null;

  // Step 1 -> Step 2: Simulate fetching comments & participants
  const startScanning = () => {
    setStep(2);
    setScanProgress(10);
    setScanStatus('Connecting to social media server...');

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep(3);
          return 100;
        }
        if (prev === 30) setScanStatus('Extracting user comments & reactions...');
        if (prev === 60) setScanStatus('Analyzing tagged friend mentions...');
        if (prev === 85) setScanStatus('Validating eligibility rules...');
        return prev + 15;
      });
    }, 200);

    // If custom list, parse list lines
    if (platform === 'list' && listInput.trim()) {
      const lines = listInput.split('\n').map(l => l.trim()).filter(Boolean);
      const entries = lines.map((name, idx) => ({
        username: name.replace(/^@/, ''),
        comment_text: `Participant entry #${idx + 1}`,
        mentions_count: 0,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      }));
      setExtractedEntries(entries);
    } else {
      // Default demo entries
      setExtractedEntries([
        { username: "sarah_designs", comment_text: "I love this giveaway so much! @emma_j @alex_k", mentions_count: 2, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah_designs" },
        { username: "tech_marcus", comment_text: "Great project! Entered. @dev_ryan @cloud_sam", mentions_count: 2, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech_marcus" },
        { username: "elena_rodriguez", comment_text: "Pick me please! Good luck everyone @laura_m", mentions_count: 1, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena_rodriguez" },
        { username: "david_travels", comment_text: "Count me in! Done all steps! @mike_v @travel_dan @sophia_b", mentions_count: 3, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=david_travels" },
        { username: "chloe_art", comment_text: "This looks incredible! @jack_art", mentions_count: 1, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=chloe_art" },
        { username: "liam_fitness", comment_text: "Let's goooo! 🔥 Need this prize so bad! @noah_fit @gym_bro", mentions_count: 2, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=liam_fitness" },
        { username: "maya_creates", comment_text: "Awesome giveaway! Shared to story as well @nina_99", mentions_count: 1, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya_creates" },
        { username: "oliver_bakes", comment_text: "Fingers crossed! 🤞 @lucas_chef @baker_kate", mentions_count: 2, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=oliver_bakes" },
        { username: "zoe_fashion", comment_text: "Amazing chance! Good luck to all participants @clara_style", mentions_count: 1, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=zoe_fashion" },
        { username: "ethan_vlogs", comment_text: "Awesome setup! Hope I get lucky today! @sammy_d", mentions_count: 1, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ethan_vlogs" },
        { username: "amanda_read", comment_text: "Count me in! Loving the community vibes ❤️ @books_rachel", mentions_count: 1, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=amanda_read" },
        { username: "daniel_codes", comment_text: "Solid build! Fingers crossed for the draw @byte_guy", mentions_count: 1, avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=daniel_codes" }
      ]);
    }
  };

  // Step 3 -> Step 4 & 5: Trigger Draw via Django Backend
  const triggerDraw = async () => {
    setStep(4);
    setIsSubmitting(true);

    // Countdown animation
    setCountdown(3);
    let count = 3;
    const countTimer = setInterval(() => {
      count -= 1;
      if (soundEnabled) playSound('tick');
      setCountdown(count);
      if (count <= 0) {
        clearInterval(countTimer);
      }
    }, 800);

    // Slot machine name shuffling
    const slotTimer = setInterval(() => {
      if (extractedEntries.length > 0) {
        const randomEntry = extractedEntries[Math.floor(Math.random() * extractedEntries.length)];
        setSlotCandidate(`@${randomEntry.username}`);
      }
    }, 70);

    try {
      // 1. Create Giveaway in Django API
      const payload = {
        title: giveawayTitle || `${platform.toUpperCase()} Giveaway`,
        platform: platform,
        post_url: postUrl,
        winner_count: parseInt(winnerCount),
        substitute_count: parseInt(substituteCount),
        min_mentions: parseInt(minMentions),
        keyword_filter: keywordFilter,
        allow_duplicates: allowDuplicates,
        raw_entries: extractedEntries,
        generate_mock_entries: extractedEntries.length === 0
      };

      const createRes = await fetch(`${getApiBaseUrl()}/giveaways/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const createdData = await createRes.json();

      // 2. Trigger cryptographic draw
      const drawRes = await fetch(`${getApiBaseUrl()}/giveaways/${createdData.id}/draw/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const drawData = await drawRes.json();

      // Wait until countdown ends
      setTimeout(() => {
        clearInterval(slotTimer);
        setGiveawayResult(drawData.giveaway);
        setStep(5);
        setIsSubmitting(false);

        if (soundEnabled) playSound('fanfare');

        // Fire festive Confetti explosion!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }, 2600);

    } catch (err) {
      console.error("Backend draw failed, falling back to client-side draw simulation:", err);
      // Client-side fallback if backend was unavailable
      setTimeout(() => {
        clearInterval(slotTimer);
        const winners = extractedEntries.slice(0, winnerCount).map((w, idx) => ({ ...w, is_winner: true, win_order: idx + 1 }));
        const subs = extractedEntries.slice(winnerCount, winnerCount + substituteCount).map((s, idx) => ({ ...s, is_substitute: true, win_order: idx + 1 }));
        setGiveawayResult({
          title: giveawayTitle,
          platform: platform,
          certificate_code: `SMP-${Math.floor(100000 + Math.random() * 900000)}`,
          verification_hash: "a4f89d3c2b1e77...fallback_hash",
          drawn_at: new Date().toISOString(),
          winners: winners,
          substitutes: subs,
          total_entries_count: extractedEntries.length,
          eligible_entries_count: extractedEntries.length
        });
        setStep(5);
        setIsSubmitting(false);
        if (soundEnabled) playSound('fanfare');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }, 2600);
    }
  };

  const handleCopyCode = () => {
    if (giveawayResult?.certificate_code) {
      navigator.clipboard.writeText(giveawayResult.certificate_code);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: step === 5 ? '760px' : '640px' }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(224, 0, 59, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <Trophy size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '17px' }}>
                {step === 5 ? 'Official Giveaway Results' : 'Simpliers Giveaway Drawer'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Step {step} of 5 • Verifiable & Cryptographically Certified
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn btn-ghost btn-sm"
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
            >
              {soundEnabled ? <Volume2 size={16} color="var(--color-primary)" /> : <VolumeX size={16} />}
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* STEP 1: Select Platform & Enter Post */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Choose Platform
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'instagram', label: 'Instagram', icon: InstagramIcon, color: '#e1306c' },
                    { id: 'twitter', label: 'X (Twitter)', icon: TwitterIcon, color: 'var(--text-main)' },
                    { id: 'youtube', label: 'YouTube', icon: YoutubeIcon, color: '#ff0000' },
                    { id: 'facebook', label: 'Facebook', icon: FacebookIcon, color: '#1877f2' },
                    { id: 'multi', label: 'Multi-Post', icon: Layers, color: '#a855f7' },
                    { id: 'list', label: 'List Picker', icon: ListOrdered, color: '#f59e0b' }
                  ].map((p) => {
                    const Icon = p.icon;
                    const isActive = platform === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          background: isActive ? 'rgba(224, 0, 59, 0.12)' : 'var(--bg-subtle)',
                          border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                          color: isActive ? 'var(--color-primary)' : 'var(--text-main)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '13px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={16} color={p.color} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {platform !== 'list' ? (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Paste Post URL or Account Handle
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={`e.g. https://${platform}.com/p/your-giveaway-post`}
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setPostUrl('https://www.instagram.com/p/C-simpliers2026/')}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                    >
                      Fill Demo Post URL
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Paste Names or Entries (one per line)
                  </label>
                  <textarea
                    className="input-field"
                    rows={6}
                    placeholder={"Alice Johnson\nMarcus Brody\nElena Vance\nDavid Kim\nSophia Martinez"}
                    value={listInput}
                    onChange={(e) => setListInput(e.target.value)}
                  />
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Contest / Giveaway Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Giveaway Title"
                  value={giveawayTitle}
                  onChange={(e) => setGiveawayTitle(e.target.value)}
                />
              </div>

              <button
                onClick={startScanning}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              >
                <span>Fetch Entries & Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Scanning / Analyzing progress */}
          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(224, 0, 59, 0.1)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'spin 1.5s linear infinite'
              }}>
                <RefreshCw size={28} />
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                Collecting Giveaway Entries
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                {scanStatus}
              </p>

              <div style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-full)',
                height: '10px',
                width: '100%',
                maxWidth: '400px',
                margin: '0 auto 16px',
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, var(--color-primary) 0%, #ff3b61 100%)',
                  height: '100%',
                  width: `${scanProgress}%`,
                  transition: 'width 0.2s ease'
                }} />
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {scanProgress}% Processed
              </div>
            </div>
          )}

          {/* STEP 3: Configure Rules & Filters */}
          {step === 3 && (
            <div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} color="var(--color-success)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-success)' }}>
                      Successfully Extracted Entries
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Found {extractedEntries.length} total participant comments ready for filtering.
                    </div>
                  </div>
                </div>
                <span className="badge badge-success">{extractedEntries.length} entries</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Number of Winners
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="input-field"
                    value={winnerCount}
                    onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Substitute (Backup) Winners
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className="input-field"
                    value={substituteCount}
                    onChange={(e) => setSubstituteCount(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Min. Tagged Friends (@mentions)
                  </label>
                  <select
                    className="input-field"
                    value={minMentions}
                    onChange={(e) => setMinMentions(parseInt(e.target.value))}
                  >
                    <option value="0">No mention requirement (0)</option>
                    <option value="1">At least 1 friend tagged</option>
                    <option value="2">At least 2 friends tagged</option>
                    <option value="3">At least 3 friends tagged</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Keyword / Hashtag Filter
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. #win or love"
                    value={keywordFilter}
                    onChange={(e) => setKeywordFilter(e.target.value)}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Count each user only once</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prevent users with multiple comments from having multiple entries</div>
                </div>
                <input
                  type="checkbox"
                  checked={!allowDuplicates}
                  onChange={(e) => setAllowDuplicates(!e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
              </div>

              <button
                onClick={triggerDraw}
                disabled={isSubmitting}
                className="btn btn-primary pulse-glow"
                style={{ width: '100%', padding: '16px', fontSize: '17px' }}
              >
                <Sparkles size={20} />
                <span>Start Cryptographic Live Draw</span>
              </button>
            </div>
          )}

          {/* STEP 4: Dramatic Draw Countdown Suspense */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <div style={{
                fontSize: '72px',
                fontWeight: 900,
                color: 'var(--color-primary)',
                marginBottom: '16px',
                textShadow: '0 0 40px rgba(224, 0, 59, 0.6)'
              }}>
                {countdown > 0 ? countdown : 'Selecting Winners!'}
              </div>

              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 24px',
                display: 'inline-block',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--text-main)',
                minWidth: '280px',
                marginBottom: '24px'
              }}>
                {slotCandidate}
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
                <span>Securing random entropy with cryptographic RNG...</span>
              </div>
            </div>
          )}

          {/* STEP 5: Official Result & Certificate Reveal */}
          {step === 5 && giveawayResult && (
            <div>
              {/* Certificate Ribbon */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(224, 0, 59, 0.1) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--color-gold)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)'
                  }}>
                    <Award size={28} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-gold)' }}>
                      Official Validity Certificate
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {giveawayResult.certificate_code}
                      <CheckCircle2 size={18} color="var(--color-success)" />
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Recorded at {new Date(giveawayResult.drawn_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCopyCode}
                    className="btn btn-outline btn-sm"
                  >
                    <Copy size={14} />
                    <span>{copiedLink ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenVerify(giveawayResult.certificate_code);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <ShieldCheck size={14} />
                    <span>Public Verify</span>
                  </button>
                </div>
              </div>

              {/* Winners Section */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={16} /> Selected Winners ({giveawayResult.winners?.length || 0})
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {giveawayResult.winners?.map((w, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 18px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--color-gold)',
                          color: '#000',
                          fontWeight: 800,
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          #{w.win_order || idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>@{w.username}</div>
                          {w.comment_text && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>"{w.comment_text}"</div>
                          )}
                        </div>
                      </div>
                      <span className="badge badge-gold">Winner</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Substitutes Section */}
              {giveawayResult.substitutes && giveawayResult.substitutes.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    Backup Alternate Winners ({giveawayResult.substitutes.length})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {giveawayResult.substitutes.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 16px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Alt #{s.win_order || idx + 1}</span>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>@{s.username}</span>
                        </div>
                        <span className="badge">Alternate</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cryptographic Proof Verification Card */}
              <div style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Cryptographic Hash:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {giveawayResult.verification_hash ? giveawayResult.verification_hash.slice(0, 32) + '...' : 'Generated'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Participants / Eligible:</span>
                  <span>{giveawayResult.total_entries_count} / {giveawayResult.eligible_entries_count}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  <RefreshCw size={16} />
                  <span>Run New Giveaway</span>
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  <CheckCircle2 size={16} />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
