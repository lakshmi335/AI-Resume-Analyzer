import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Briefcase, TrendingUp } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────
const getMatchColor = (match) => {
  if (match >= 85) return '#10b981';
  if (match >= 70) return '#6366f1';
  if (match >= 55) return '#f59e0b';
  return '#ef4444';
};

const getLevelStyle = (level) => {
  const map = {
    Junior:    { bg: 'rgba(59,130,246,0.12)',  color: '#93c5fd' },
    Mid:       { bg: 'rgba(99,102,241,0.12)',  color: '#a5b4fc' },
    Senior:    { bg: 'rgba(16,185,129,0.12)',  color: '#6ee7b7' },
    Lead:      { bg: 'rgba(245,158,11,0.12)',  color: '#fcd34d' },
    Principal: { bg: 'rgba(239,68,68,0.12)',   color: '#fca5a5' },
  };
  return map[level] || map.Mid;
};

// ── Single Role Card ──────────────────────────────────────
const RoleCard = ({ role, index }) => {
  const [open, setOpen] = useState(false);
  const matchColor = getMatchColor(role.match);
  const levelStyle = getLevelStyle(role.level);

  return (
    <div
      style={{
        background: '#0a0f1a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = matchColor)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
    >
      {/* Header row */}
      <div
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(!open)}
      >
        {/* Rank badge */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: `${matchColor}20`,
            border: `1px solid ${matchColor}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: matchColor }}>
            #{index + 1}
          </span>
        </div>

        {/* Title + level + salary */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>
              {role.title}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: 20,
                background: levelStyle.bg,
                color: levelStyle.color,
              }}
            >
              {role.level}
            </span>
          </div>
          {role.avgSalary && (
            <span style={{ fontSize: '0.78rem', color: '#475569' }}>{role.avgSalary}</span>
          )}
        </div>

        {/* Match percentage */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div
            style={{
              fontSize: '1.3rem',
              fontWeight: 800,
              fontFamily: 'Syne,sans-serif',
              color: matchColor,
            }}
          >
            {role.match}%
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Match
          </div>
        </div>

        {/* Expand chevron */}
        <div style={{ color: '#475569' }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#1e293b' }}>
        <div
          style={{
            height: '100%',
            width: `${role.match}%`,
            background: matchColor,
            transition: 'width 1s ease',
          }}
        />
      </div>

      {/* Expanded details */}
      {open && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {role.reason && (
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              {role.reason}
            </p>
          )}

          {role.skills?.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.4rem',
                }}
              >
                Key Skills Required
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {role.skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 20,
                      background: 'rgba(99,102,241,0.1)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() =>
              window.open(
                `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role.title)}`,
                '_blank'
              )
            }
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.9rem',
              borderRadius: 8,
              border: `1px solid ${matchColor}40`,
              background: `${matchColor}10`,
              color: matchColor,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Briefcase size={13} /> Find Jobs on LinkedIn →
          </button>
        </div>
      )}
    </div>
  );
};

// ── Exported List Component ───────────────────────────────
/**
 * Usage:
 * <JobRoles roles={analysis.suitableRoles} />
 */
const JobRoles = ({ roles, title = 'Suitable Job Roles For You' }) => {
  if (!roles || roles.length === 0) return null;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <TrendingUp size={18} style={{ color: '#6366f1' }} />
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
          {title}
        </h3>
      </div>

      <div
        style={{
          marginBottom: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: 10,
        }}
      >
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
          🎯 Based on your skills and experience, here are the{' '}
          <strong style={{ color: '#a5b4fc' }}>top {roles.length} roles</strong> that match your
          profile. Click any role to see details and find jobs.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {roles.map((role, i) => (
          <RoleCard key={i} role={role} index={i} />
        ))}
      </div>
    </div>
  );
};

export default JobRoles;