import { useEffect, useState } from 'react'

interface StreakCelebrationProps {
  streak: number
  onComplete: () => void
}

export function StreakCelebration({ streak, onComplete }: StreakCelebrationProps) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')
  const isIce = streak >= 2

  useEffect(() => {
    // enter → hold after 600ms
    const t1 = setTimeout(() => setPhase('hold'), 600)
    // hold → exit after 2.2s
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    // call onComplete after exit animation finishes (300ms)
    const t3 = setTimeout(() => onComplete(), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: isIce
      ? 'radial-gradient(ellipse at center, rgba(30,58,138,0.97) 0%, rgba(15,20,25,0.99) 100%)'
      : 'radial-gradient(ellipse at center, rgba(124,45,18,0.97) 0%, rgba(15,20,25,0.99) 100%)',
    opacity: phase === 'exit' ? 0 : 1,
    transform: phase === 'enter' ? 'scale(1.04)' : 'scale(1)',
    transition: phase === 'exit'
      ? 'opacity 0.35s ease-in, transform 0.35s ease-in'
      : 'opacity 0.4s ease-out, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
    pointerEvents: phase === 'exit' ? 'none' : 'all',
  }

  return (
    <div style={overlayStyle}>
      {/* Particles */}
      <Particles isIce={isIce} />

      {/* Big icon */}
      <div style={{
        transform: phase === 'enter' ? 'scale(0.3)' : phase === 'hold' ? 'scale(1)' : 'scale(1.1)',
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        marginBottom: '28px',
      }}>
        {isIce ? <BigIce /> : <BigFire />}
      </div>

      {/* Streak number */}
      <div style={{
        fontSize: '80px',
        fontWeight: 700,
        lineHeight: 1,
        color: isIce ? '#93c5fd' : '#fdba74',
        transform: phase === 'enter' ? 'translateY(30px)' : 'translateY(0)',
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'transform 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s 0.1s ease',
        marginBottom: '12px',
      }}>
        {streak}
      </div>

      {/* Label */}
      <div style={{
        fontSize: '20px',
        fontWeight: 500,
        color: isIce ? '#bfdbfe' : '#fed7aa',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'translateY(16px)' : 'translateY(0)',
        transition: 'opacity 0.4s 0.2s ease, transform 0.4s 0.2s ease',
        marginBottom: '8px',
      }}>
        {streak === 1 ? 'Day streak!' : `Day streak!`}
      </div>

      <div style={{
        fontSize: '14px',
        color: isIce ? '#93c5fd99' : '#fb923c99',
        opacity: phase === 'enter' ? 0 : 1,
        transition: 'opacity 0.4s 0.35s ease',
      }}>
        {streak === 1
          ? 'Welcome! Keep coming back daily.'
          : `${streak} days in a row — keep it going!`}
      </div>
    </div>
  )
}

function BigFire() {
  return (
    <svg width="140" height="160" viewBox="0 0 140 160" fill="none"
      style={{ filter: 'drop-shadow(0 0 32px #f9731680)', animation: 'bigFlicker 1.2s ease-in-out infinite' }}>
      <style>{`
        @keyframes bigFlicker {
          0%,100% { transform: scaleX(1) scaleY(1); }
          30% { transform: scaleX(1.07) scaleY(0.95); }
          60% { transform: scaleX(0.94) scaleY(1.07); }
        }
      `}</style>
      <path d="M70 4C70 4 38 44 38 76C38 92 46 104 56 108C56 88 64 76 70 72C76 76 84 88 84 108C94 104 102 92 102 76C102 52 86 28 70 4Z" fill="#fb923c"/>
      <path d="M70 4C70 4 52 28 52 52C52 64 58 72 64 76C64 60 68 52 70 48C72 52 76 60 76 76C82 72 88 64 88 52C88 28 70 4 70 4Z" fill="#fbbf24"/>
      <path d="M70 56C70 56 58 72 58 88C58 98 63 105 70 108C77 105 82 98 82 88C82 72 70 56 70 56Z" fill="#fde68a"/>
      <ellipse cx="70" cy="128" rx="32" ry="10" fill="#fb923c" opacity="0.25"/>
    </svg>
  )
}

function BigIce() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none"
      style={{ filter: 'drop-shadow(0 0 32px #3b82f680)', animation: 'bigSpin 4s linear infinite' }}>
      <style>{`
        @keyframes bigSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <g transform="rotate(0 70 70)">
        <line x1="70" y1="8" x2="70" y2="132" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round"/>
        <line x1="40" y1="28" x2="100" y2="28" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="40" y1="112" x2="100" y2="112" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round"/>
      </g>
      <g transform="rotate(60 70 70)">
        <line x1="70" y1="8" x2="70" y2="132" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round"/>
        <line x1="40" y1="28" x2="100" y2="28" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="40" y1="112" x2="100" y2="112" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round"/>
      </g>
      <g transform="rotate(120 70 70)">
        <line x1="70" y1="8" x2="70" y2="132" stroke="#60a5fa" strokeWidth="6" strokeLinecap="round"/>
        <line x1="40" y1="28" x2="100" y2="28" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round"/>
        <line x1="40" y1="112" x2="100" y2="112" stroke="#93c5fd" strokeWidth="3.5" strokeLinecap="round"/>
      </g>
      <circle cx="70" cy="70" r="14" fill="#bfdbfe"/>
      <circle cx="70" cy="70" r="8" fill="#dbeafe"/>
    </svg>
  )
}

function Particles({ isIce }: { isIce: boolean }) {
  const color = isIce ? '#60a5fa' : '#fb923c'
  const color2 = isIce ? '#93c5fd' : '#fde68a'
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360
    const dist = 120 + Math.random() * 80
    const size = 4 + Math.random() * 6
    const delay = Math.random() * 0.4
    return { angle, dist, size, delay, color: i % 2 === 0 ? color : color2 }
  })

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          opacity: 0.7,
          animation: `particle${i} 1.8s ${p.delay}s ease-out infinite`,
        }} />
      ))}
      <style>{particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180
        const tx = Math.cos(rad) * p.dist
        const ty = Math.sin(rad) * p.dist
        return `
          @keyframes particle${i} {
            0%   { transform: translate(-50%,-50%) translate(0,0); opacity:0.8; }
            100% { transform: translate(-50%,-50%) translate(${tx}px,${ty}px); opacity:0; }
          }
        `
      }).join('')}</style>
    </div>
  )
}