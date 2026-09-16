import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CircleDot, 
  Sparkles, 
  Dice6, 
  Hash, 
  Wand2, 
  Copy, 
  Check, 
  RotateCw, 
  Trophy 
} from 'lucide-react';
import { getApiBaseUrl } from '../services/api';

export default function ToolsModal({ isOpen, onClose, initialTool = 'wheel' }) {
  const [activeTool, setActiveTool] = useState(initialTool);

  useEffect(() => {
    if (initialTool) setActiveTool(initialTool);
  }, [initialTool]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Tool Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'wheel', label: 'Spin Wheel', icon: CircleDot, color: '#f59e0b' },
              { id: 'coin', label: 'Flip Coin', icon: Sparkles, color: '#10b981' },
              { id: 'dice', label: 'Roll Dice', icon: Dice6, color: '#3b82f6' },
              { id: 'numbers', label: 'Random Numbers', icon: Hash, color: '#e0003b' },
              { id: 'caption', label: 'Caption Generator', icon: Wand2, color: '#a855f7' },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTool(t.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--bg-subtle)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--border-active)' : 'transparent'}`,
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} color={t.color} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tool Content Area */}
        <div style={{ padding: '24px' }}>
          {activeTool === 'wheel' && <SpinWheelTool />}
          {activeTool === 'coin' && <CoinFlipTool />}
          {activeTool === 'dice' && <DiceRollTool />}
          {activeTool === 'numbers' && <RandomNumbersTool />}
          {activeTool === 'caption' && <CaptionGeneratorTool />}
        </div>
      </div>
    </div>
  );
}

// 1. Spin the Wheel Component
function SpinWheelTool() {
  const canvasRef = useRef(null);
  const [items, setItems] = useState(['$100 Gift Card', 'iPhone 15', 'AirPods Pro', 'Mystery Box', 'Free Subscription', 'Try Again']);
  const [inputText, setInputText] = useState('$100 Gift Card\niPhone 15\nAirPods Pro\nMystery Box\nFree Subscription\nTry Again');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const currentAngleRef = useRef(0);

  const colors = ['#e0003b', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const drawWheel = (angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = center - 15;
    const arc = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, width, height);

    items.forEach((item, i) => {
      const itemAngle = angle + i * arc;
      ctx.beginPath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, itemAngle, itemAngle + arc);
      ctx.lineTo(center, center);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(itemAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Poppins, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(item.length > 14 ? item.slice(0, 14) + '..' : item, radius - 20, 5);
      ctx.restore();
    });

    // Outer Border & Center Pin
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#151a26';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [items]);

  const handleUpdateItems = () => {
    const list = inputText.split('\n').map(s => s.trim()).filter(Boolean);
    if (list.length >= 2) {
      setItems(list);
      setWinner(null);
    }
  };

  const spin = () => {
    if (isSpinning || items.length < 2) return;
    setIsSpinning(true);
    setWinner(null);

    const spinRotations = 5 + Math.random() * 4;
    const finalAngle = currentAngleRef.current + spinRotations * 2 * Math.PI;
    const duration = 4000;
    const startTime = performance.now();
    const startAngle = currentAngleRef.current;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const angle = startAngle + (finalAngle - startAngle) * easeOut;
      currentAngleRef.current = angle % (2 * Math.PI);
      drawWheel(currentAngleRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate winning index (pointer at top 270 deg = 3*PI/2)
        const arc = (2 * Math.PI) / items.length;
        const normalizedAngle = (2 * Math.PI - (currentAngleRef.current % (2 * Math.PI)) + 1.5 * Math.PI) % (2 * Math.PI);
        const winIndex = Math.floor(normalizedAngle / arc) % items.length;
        setWinner(items[winIndex]);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
      <div style={{ position: 'relative', textAlign: 'center' }}>
        {/* Top Pointer Indicator */}
        <div style={{
          position: 'absolute',
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '20px solid var(--color-primary)',
          zIndex: 10,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
        }} />
        <canvas ref={canvasRef} width={280} height={280} style={{ maxWidth: '100%' }} />
        {winner && (
          <div style={{
            marginTop: '12px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: 'var(--color-gold)',
            fontWeight: 800,
            fontSize: '16px'
          }}>
            🎉 Winner: {winner}!
          </div>
        )}
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
          Wheel Segments (One per line)
        </label>
        <textarea
          className="input-field"
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onBlur={handleUpdateItems}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button onClick={handleUpdateItems} className="btn btn-outline btn-sm">
            Update
          </button>
          <button
            onClick={spin}
            disabled={isSpinning}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <RotateCw size={16} />
            <span>{isSpinning ? 'Spinning...' : 'Spin the Wheel!'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. 3D Coin Flip Tool
function CoinFlipTool() {
  const [result, setResult] = useState('Heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [stats, setStats] = useState({ heads: 0, tails: 0, total: 0 });

  const flip = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    const outcomes = ['Heads', 'Tails'];
    const pick = outcomes[Math.floor(Math.random() * outcomes.length)];

    setTimeout(() => {
      setResult(pick);
      setIsFlipping(false);
      setStats(prev => ({
        heads: prev.heads + (pick === 'Heads' ? 1 : 0),
        tails: prev.tails + (pick === 'Tails' ? 1 : 0),
        total: prev.total + 1
      }));
    }, 1000);
  };

  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <div style={{ perspective: '800px', display: 'inline-block', marginBottom: '24px' }}>
        <div style={{
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: result === 'Heads'
            ? 'linear-gradient(135deg, #f59e0b 0%, #ffd200 100%)'
            : 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontWeight: 900,
          fontSize: '22px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          border: '6px solid rgba(255, 255, 255, 0.4)',
          transform: isFlipping ? 'rotateY(1080deg) scale(1.1)' : 'rotateY(0deg) scale(1)',
          transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {result}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <div>Heads: <strong style={{ color: 'var(--text-main)' }}>{stats.heads}</strong></div>
        <div>Tails: <strong style={{ color: 'var(--text-main)' }}>{stats.tails}</strong></div>
        <div>Total Flips: <strong style={{ color: 'var(--text-main)' }}>{stats.total}</strong></div>
      </div>

      <button onClick={flip} disabled={isFlipping} className="btn btn-primary btn-lg" style={{ minWidth: '200px' }}>
        <Sparkles size={18} />
        <span>{isFlipping ? 'Flipping...' : 'Flip Coin'}</span>
      </button>
    </div>
  );
}

// 3. Virtual Dice Roll Tool
function DiceRollTool() {
  const [diceCount, setDiceCount] = useState(2);
  const [rolls, setRolls] = useState([4, 6]);
  const [isRolling, setIsRolling] = useState(false);

  const roll = () => {
    if (isRolling) return;
    setIsRolling(true);

    setTimeout(() => {
      const newRolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      setRolls(newRolls);
      setIsRolling(false);
    }, 600);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
        {rolls.map((val, idx) => (
          <div
            key={idx}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '16px',
              background: 'var(--bg-card)',
              border: '2px solid var(--border-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--color-primary)',
              boxShadow: 'var(--shadow-md)',
              transform: isRolling ? 'rotate(360deg) scale(0.9)' : 'none',
              transition: 'transform 0.6s ease'
            }}
          >
            {val}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
        Total Sum: <span className="gradient-text-primary">{rolls.reduce((a, b) => a + b, 0)}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Dice Count:</span>
        {[1, 2, 3, 4].map(n => (
          <button
            key={n}
            onClick={() => { setDiceCount(n); setRolls(Array(n).fill(1)); }}
            className={`btn btn-sm ${diceCount === n ? 'btn-primary' : 'btn-outline'}`}
          >
            {n}
          </button>
        ))}
      </div>

      <button onClick={roll} disabled={isRolling} className="btn btn-primary btn-lg">
        <Dice6 size={20} />
        <span>{isRolling ? 'Rolling...' : 'Roll Dice'}</span>
      </button>
    </div>
  );
}

// 4. Random Numbers Tool (Backend Connected)
function RandomNumbersTool() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(5);
  const [unique, setUnique] = useState(true);
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/tools/random-number/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ min, max, count, allow_duplicates: !unique })
      });
      const data = await res.json();
      setNumbers(data.numbers || []);
    } catch {
      // Fallback
      const arr = [];
      while (arr.length < count) {
        const n = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!unique || !arr.includes(n)) arr.push(n);
      }
      setNumbers(arr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Min</label>
          <input type="number" className="input-field" value={min} onChange={(e) => setMin(parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Max</label>
          <input type="number" className="input-field" value={max} onChange={(e) => setMax(parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Count</label>
          <input type="number" className="input-field" value={count} min="1" max="50" onChange={(e) => setCount(parseInt(e.target.value) || 1)} />
        </div>
      </div>

      <button onClick={generate} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }}>
        <Hash size={18} />
        <span>Generate Cryptographic Random Numbers</span>
      </button>

      {numbers.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '16px',
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          {numbers.map((num, i) => (
            <div
              key={i}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(224, 0, 59, 0.12)',
                border: '1px solid rgba(224, 0, 59, 0.3)',
                color: 'var(--color-primary)',
                fontWeight: 800,
                fontSize: '18px'
              }}
            >
              {num}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 5. Giveaway Caption Generator Tool (Backend Connected)
function CaptionGeneratorTool() {
  const [platform, setPlatform] = useState('Instagram');
  const [prize, setPrize] = useState('iPhone 15 Pro & AirPods Max');
  const [conditions, setConditions] = useState('Like, Follow & Tag 2 besties');
  const [captions, setCaptions] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateCaptions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/tools/caption-generator/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, prize, conditions })
      });
      const data = await res.json();
      setCaptions(data.captions || []);
    } catch {
      setCaptions([
        `🎉 GIVEAWAY ALERT! 🎉\n\nWin a ${prize}! ✨\n\nHow to enter:\n1. Follow us\n2. Like this post ❤️\n3. ${conditions}\n\nGood luck! 🍀 #giveaway #contest`
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Platform</label>
          <select className="input-field" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option>Instagram</option>
            <option>Twitter</option>
            <option>YouTube</option>
            <option>Facebook</option>
            <option>TikTok</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Prize</label>
          <input className="input-field" value={prize} onChange={(e) => setPrize(e.target.value)} />
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Participation Steps</label>
        <input className="input-field" value={conditions} onChange={(e) => setConditions(e.target.value)} />
      </div>

      <button onClick={generateCaptions} disabled={loading} className="btn btn-primary" style={{ width: '100%', marginBottom: '20px' }}>
        <Wand2 size={18} />
        <span>Generate Viral Captions</span>
      </button>

      {captions.map((cap, idx) => (
        <div
          key={idx}
          style={{
            position: 'relative',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '12px',
            fontSize: '13px',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}
        >
          <button
            onClick={() => copyText(cap, idx)}
            className="btn btn-outline btn-sm"
            style={{ position: 'absolute', top: '12px', right: '12px' }}
          >
            {copiedIdx === idx ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
            <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
          </button>
          {cap}
        </div>
      ))}
    </div>
  );
}
