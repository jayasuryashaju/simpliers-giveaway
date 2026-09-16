import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Award, 
  Layers, 
  ListOrdered, 
  Calendar, 
  Hash, 
  Copy, 
  Check 
} from 'lucide-react';
import { InstagramIcon, TwitterIcon, YoutubeIcon, FacebookIcon } from './SocialIcons';
import { getApiBaseUrl } from '../services/api';

export default function VerifyCertificateModal({ isOpen, onClose, initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      handleVerify(initialCode);
    } else {
      setCertificateData(null);
      setError(null);
    }
  }, [initialCode, isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (queryCode) => {
    const searchCode = queryCode || code;
    if (!searchCode || !searchCode.trim()) return;

    setLoading(true);
    setError(null);
    setCertificateData(null);

    try {
      const formatted = searchCode.toUpperCase().startsWith('SMP-') 
        ? searchCode.toUpperCase() 
        : `SMP-${searchCode.toUpperCase()}`;

      const res = await fetch(`${getApiBaseUrl()}/giveaways/verify/${encodeURIComponent(formatted)}/`);
      if (!res.ok) {
        throw new Error(`No verified certificate found with code '${formatted}'`);
      }
      const data = await res.json();
      setCertificateData(data);
    } catch (err) {
      setError(err.message || 'Failed to verify certificate.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = () => {
    if (certificateData?.verification_hash) {
      navigator.clipboard.writeText(certificateData.verification_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPlatformIcon = (plat) => {
    switch (plat) {
      case 'instagram': return <InstagramIcon size={18} color="#e1306c" />;
      case 'twitter': return <TwitterIcon size={18} color="var(--text-main)" />;
      case 'youtube': return <YoutubeIcon size={18} color="#ff0000" />;
      case 'facebook': return <FacebookIcon size={18} color="#1877f2" />;
      case 'multi': return <Layers size={18} color="#a855f7" />;
      default: return <ListOrdered size={18} color="#f59e0b" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
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
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px' }}>
                Simpliers Validity Certificate Verification
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Official Public Registry of Authentic Draws
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '24px 24px 16px' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookupCertificate(code);
            }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '42px' }}
                placeholder="Enter Certificate Code e.g. SMP-772910 or SMP-491028"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0 24px' }}>
              {loading ? 'Verifying...' : 'Search'}
            </button>
          </form>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Try verified codes:</span>
            <button
              type="button"
              onClick={() => { setCode('SMP-772910'); lookupCertificate('SMP-772910'); }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              SMP-772910
            </button>
            <button
              type="button"
              onClick={() => { setCode('SMP-491028'); lookupCertificate('SMP-491028'); }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              SMP-491028
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div style={{ padding: '0 24px 24px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--color-error)',
              fontSize: '14px'
            }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {certificateData && (
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              marginTop: '12px',
              boxShadow: 'var(--shadow-md)'
            }}>
              {/* Authenticity Badge */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '18px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Award size={32} color="var(--color-gold)" />
                  <div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 800, color: 'var(--color-gold)' }}>
                      Verified Valid Certificate
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-main)' }}>
                      {certificateData.certificate_code}
                    </div>
                  </div>
                </div>

                <div className="badge badge-success" style={{ padding: '6px 14px', fontSize: '12px' }}>
                  <CheckCircle2 size={14} /> Certified Authentic
                </div>
              </div>

              {/* Contest Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Contest Title</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getPlatformIcon(certificateData.platform)}
                    <span>{certificateData.title}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Draw Timestamp</div>
                  <div style={{ fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span>{certificateData.drawn_at ? new Date(certificateData.drawn_at).toLocaleString() : 'Completed'}</span>
                  </div>
                </div>
              </div>

              {/* Winners Table */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={14} /> Official Verified Winners
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {certificateData.winners?.map((w, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                      }}
                    >
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
                        }}>
                          #{w.win_order || idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>@{w.username}</div>
                          {w.comment_text && (
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>"{w.comment_text}"</div>
                          )}
                        </div>
                      </div>
                      <span className="badge badge-gold">Verified Winner</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic SHA256 Fingerprint */}
              <div style={{
                background: 'var(--bg-card)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Cryptographic SHA-256 Certificate Hash
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {certificateData.verification_hash}
                  </div>
                </div>

                <button
                  onClick={handleCopyHash}
                  className="btn btn-ghost btn-sm"
                  title="Copy Hash"
                  style={{ padding: '6px 10px' }}
                >
                  {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
