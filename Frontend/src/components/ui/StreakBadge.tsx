import { useEffect, useState } from 'react'

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    setAnimate(true)
    const t = setTimeout(() => setAnimate(false), 800)
    return () => clearTimeout(t)
  }, [streak])

  if (streak === 0) return null

  const isIce = streak >= 2
  const label = isIce ? 'Ice streak' : 'Fire streak'

  return (
    <div
      title={`${streak}-day streak!`}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px 5px 8px',
        borderRadius: '999px',
        background: isIce ? 'rgba(59,130,246,0.12)' : 'rgba(251,146,60,0.12)',
        border: `1px solid ${isIce ? 'rgba(59,130,246,0.3)' : 'rgba(251,146,60,0.3)'}`,
        cursor: 'default',
        transform: animate ? 'scale(1.15)' : 'scale(1)',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Animated icon */}
      <span style={{ position: 'relative', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isIce ? <IceIcon animate={animate} /> : <FireIcon animate={animate} />}
      </span>

      {/* Streak number */}
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: isIce ? '#3b82f6' : '#f97316',
          letterSpacing: '0.01em',
          lineHeight: 1,
        }}
      >
        {streak}
      </span>
    </div>
  )
}

function FireIcon({ animate }: { animate: boolean }) {
  return (
    <svg
      width="18"
      height="20"
      viewBox="0 0 18 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transformOrigin: 'bottom center',
        animation: animate ? 'streakFlicker 0.5s ease-in-out' : 'streakIdle 2.5s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes streakFlicker {
          0%   { transform: scaleX(1)   scaleY(1); }
          25%  { transform: scaleX(1.2) scaleY(0.85); }
          50%  { transform: scaleX(0.85) scaleY(1.2); }
          75%  { transform: scaleX(1.1) scaleY(0.92); }
          100% { transform: scaleX(1)   scaleY(1); }
        }
        @keyframes streakIdle {
          0%, 100% { transform: scaleX(1)    scaleY(1); }
          50%       { transform: scaleX(0.95) scaleY(1.06); }
        }
      `}</style>
      {/* outer flame */}
      <path
        d="M9 1C9 1 5 5.5 5 9.5C5 11.5 6 13 7 13.5C7 11 8 9.5 9 9C10 9.5 11 11 11 13.5C12 13 13 11.5 13 9.5C13 6.5 11 3.5 9 1Z"
        fill="#fb923c"
      />
      {/* inner flame */}
      <path
        d="M9 7C9 7 7.5 9 7.5 11C7.5 12.4 8.2 13.2 9 13.5C9.8 13.2 10.5 12.4 10.5 11C10.5 9 9 7 9 7Z"
        fill="#fde68a"
      />
      {/* base glow */}
      <ellipse cx="9" cy="16" rx="4" ry="1.5" fill="#fb923c" opacity="0.3" />
    </svg>
  )
}

function IceIcon({ animate }: { animate: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transformOrigin: 'center',
        animation: animate
          ? 'iceSpinBurst 0.6s ease-in-out'
          : 'iceSpin 6s linear infinite',
      }}
    >
      <style>{`
        @keyframes iceSpinBurst {
          0%   { transform: rotate(0deg)   scale(1); }
          40%  { transform: rotate(60deg)  scale(1.25); }
          100% { transform: rotate(120deg) scale(1); }
        }
        @keyframes iceSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      {/* 6-point snowflake */}
      {[0, 60, 120].map(angle => (
        <g key={angle} transform={`rotate(${angle} 10 10)`}>
          <line x1="10" y1="1" x2="10" y2="19" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="6.5" y1="4.5" x2="13.5" y2="4.5" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="6.5" y1="15.5" x2="13.5" y2="15.5" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="10" cy="10" r="2" fill="#bfdbfe" />
    </svg>
  )
}