import React from 'react';
import { Gamepad2, CheckCircle2, Lock } from 'lucide-react';

export function GameCard({
  game,
  isSelected = false,
  onSelect,
  className = '',
}) {
  const { name, tag, active, image, description } = game;

  const handleClick = () => {
    if (active && onSelect) {
      onSelect(game);
    }
  };

  return (
    <div
      className={`game-card ${isSelected ? 'selected' : ''} ${!active ? 'disabled' : ''} ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={active ? 0 : -1}
      aria-disabled={!active}
    >
      <img src={image} alt={name} className="game-card-img" />

      {!active ? (
        <div className="coming-soon-badge">
          <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
          COMING SOON
        </div>
      ) : isSelected ? (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'var(--primary)',
            color: '#FFFFFF',
            borderRadius: '50%',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          <CheckCircle2 size={18} />
        </div>
      ) : null}

      <div className="game-card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tag}
          </span>
          {active && <Gamepad2 size={16} color="var(--primary)" />}
        </div>
        <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{name}</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default GameCard;
