import React from 'react';
import { Shield, Award, Globe, Calendar, Flame, Check, X } from 'lucide-react';
import Button from './Button';

export function PlayerCard({
  playerData,
  onConfirm,
  onReject,
  isConfirmed = false,
  className = '',
}) {
  if (!playerData) return null;

  const { nickname, level, rankingPoints, rankInfo, region, accountAge } = playerData;

  return (
    <div className={`player-info-card ${className}`}>
      <div className="player-info-header">
        <div className="player-nickname">
          <span>{nickname}</span>
          {isConfirmed && (
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(0, 184, 148, 0.15)',
                color: 'var(--success)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <Check size={12} strokeWidth={3} />
              Verified Player
            </span>
          )}
        </div>

        {rankInfo && (
          <div
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: rankInfo.bgColor,
              border: `1.5px solid ${rankInfo.borderColor}`,
              color: rankInfo.color,
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Flame size={15} />
            <span>{rankInfo.name}</span>
          </div>
        )}
      </div>

      <div className="player-stats-grid">
        <div className="player-stat-item">
          <div className="player-stat-label">Game Level</div>
          <div className="player-stat-val">
            <Award size={16} color="var(--primary)" />
            <span>Level {level}</span>
          </div>
        </div>

        <div className="player-stat-item">
          <div className="player-stat-label">BR Rank Points</div>
          <div className="player-stat-val">
            <Shield size={16} color={rankInfo?.color || 'var(--primary)'} />
            <span>{rankingPoints.toLocaleString()} pts</span>
          </div>
        </div>

        <div className="player-stat-item">
          <div className="player-stat-label">Region</div>
          <div className="player-stat-val">
            <Globe size={16} color="var(--secondary)" />
            <span>{region}</span>
          </div>
        </div>

        <div className="player-stat-item">
          <div className="player-stat-label">Account Age</div>
          <div className="player-stat-val">
            <Calendar size={16} color="var(--text-secondary)" />
            <span>{accountAge}</span>
          </div>
        </div>
      </div>

      {!isConfirmed && (
        <div className="player-actions">
          <Button
            variant="success"
            size="sm"
            icon={Check}
            onClick={onConfirm}
          >
            Confirm
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={X}
            onClick={onReject}
          >
            Wrong Information
          </Button>
        </div>
      )}
    </div>
  );
}

export default PlayerCard;
