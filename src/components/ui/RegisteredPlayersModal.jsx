import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, Users, X, Check, Clock } from 'lucide-react';
import { useFormSubmissions } from '../../hooks/useFirebase';

/* Rank icons mapping to public/assets/ranks/ */
export const RANK_ICONS = {
  bronze: '/assets/ranks/bronze.webp',
  silver: '/assets/ranks/silver.webp',
  gold: '/assets/ranks/gold.webp',
  platinum: '/assets/ranks/platinum.webp',
  diamond: '/assets/ranks/diamond.webp',
  heroic: '/assets/ranks/heroic.webp',
  master: '/assets/ranks/master.webp',
  grandmaster: '/assets/ranks/master.webp',
};

export function getRankIcon(rank) {
  if (!rank) return RANK_ICONS.heroic;
  const r = String(rank).toLowerCase().trim();
  if (r.includes('grandmaster') || r.includes('master')) return RANK_ICONS.master;
  if (r.includes('heroic')) return RANK_ICONS.heroic;
  if (r.includes('diamond')) return RANK_ICONS.diamond;
  if (r.includes('platinum')) return RANK_ICONS.platinum;
  if (r.includes('gold')) return RANK_ICONS.gold;
  if (r.includes('silver')) return RANK_ICONS.silver;
  if (r.includes('bronze')) return RANK_ICONS.bronze;
  return RANK_ICONS.heroic;
}

/* Render status text (pending, approved, declined) with tick/cross/pending icon and NO capsule border */
export function renderStatusText(status) {
  const norm = String(status || 'pending').toLowerCase().trim();
  let color = '#FACC15'; // Amber
  let label = 'Pending';
  let Icon = Clock;

  if (norm === 'approved') {
    color = '#22C55E'; // Green
    label = 'Approved';
    Icon = Check;
  } else if (norm === 'declined') {
    color = '#EF4444'; // Red
    label = 'Declined';
    Icon = X;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.76rem',
        fontWeight: 700,
        color: color,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginLeft: 'auto',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      <Icon size={14} strokeWidth={2.8} />
      <span>{label}</span>
    </span>
  );
}

/* Sample fallback rosters for starter tournament forms */
const SAMPLE_SOLO_PLAYERS = [
  { uid: 's1', username: 'OP_VINCENZO', gameUid: '184729103', rank: 'Grandmaster', status: 'approved' },
  { uid: 's2', username: 'RAISTAR_99', gameUid: '294810294', rank: 'Heroic', status: 'approved' },
  { uid: 's3', username: 'AURA_DEADSHOT', gameUid: '103948271', rank: 'Diamond', status: 'approved' },
  { uid: 's4', username: 'TSG_JASH', gameUid: '401928374', rank: 'Platinum', status: 'pending' },
  { uid: 's5', username: 'MAFIA_BALWANT', gameUid: '582910482', rank: 'Gold', status: 'approved' },
  { uid: 's6', username: 'SK_SABBIR_BOSS', gameUid: '392817402', rank: 'Master', status: 'approved' },
  { uid: 's7', username: 'KILLER_FF_07', gameUid: '692019481', rank: 'Silver', status: 'pending' },
  { uid: 's8', username: 'TECH_SNIPER', gameUid: '918273645', rank: 'Bronze', status: 'declined' },
];

const SAMPLE_DUO_PLAYERS = [
  {
    uid: 'd1',
    teamName: 'TOTAL DESTRUCTION',
    leaderName: 'AJAY_PRO',
    gameUid: '192837461',
    rank: 'Grandmaster',
    status: 'approved',
    teammates: [{ username: 'AMIT_BHAI', gameUid: '918273640' }],
  },
  {
    uid: 'd2',
    teamName: 'SOUL DUO',
    leaderName: 'MORTAL_FF',
    gameUid: '283746192',
    rank: 'Master',
    status: 'approved',
    teammates: [{ username: 'VIPER_GOD', gameUid: '384756201' }],
  },
  {
    uid: 'd3',
    teamName: 'ORANGUTAN CLAN',
    leaderName: 'FROST_FIRE',
    gameUid: '475869302',
    rank: 'Diamond',
    status: 'pending',
    teammates: [{ username: 'BLAZE_KID', gameUid: '586970413' }],
  },
  {
    uid: 'd4',
    teamName: 'HYDRA FORCE',
    leaderName: 'ALPHA_HYDRA',
    gameUid: '697081524',
    rank: 'Heroic',
    status: 'declined',
    teammates: [{ username: 'BETA_STORM', gameUid: '708192635' }],
  },
];

const SAMPLE_SQUAD_PLAYERS = [
  {
    uid: 'sq1',
    teamName: 'GODLIKE ESPORTS',
    leaderName: 'NEYOOO_OP',
    gameUid: '102938475',
    rank: 'Grandmaster',
    status: 'approved',
    teammates: [
      { username: 'JONATHAN_FF', gameUid: '203948576' },
      { username: 'SHADOW_OP', gameUid: '304958687' },
      { username: 'ZGOD_GAMING', gameUid: '405968798' },
    ],
  },
  {
    uid: 'sq2',
    teamName: 'BLIND ESPORTS',
    leaderName: 'PUNKER_99',
    gameUid: '516273849',
    rank: 'Master',
    status: 'approved',
    teammates: [
      { username: 'SPY_HUNTER', gameUid: '627384950' },
      { username: 'DEVIL_MAX', gameUid: '738495061' },
      { username: 'NOVA_STRIKE', gameUid: '849506172' },
    ],
  },
  {
    uid: 'sq3',
    teamName: 'TEAM ELITE',
    leaderName: 'KILLER_ELITE',
    gameUid: '950617283',
    rank: 'Heroic',
    status: 'pending',
    teammates: [
      { username: 'ICONIC_BOY', gameUid: '162738495' },
      { username: 'PAHO_GOD', gameUid: '273849506' },
      { username: 'VASI_SHOOT', gameUid: '384950617' },
    ],
  },
  {
    uid: 'sq4',
    teamName: 'ORANGUTAN SQUAD',
    leaderName: 'ORANG_LEADER',
    gameUid: '482019382',
    rank: 'Diamond',
    status: 'declined',
    teammates: [
      { username: 'JOKER_FF', gameUid: '592019381' },
      { username: 'DEAD_EYE', gameUid: '602019380' },
      { username: 'TITAN_WAR', gameUid: '712019379' },
    ],
  },
];

export const RegisteredPlayersModal = ({
  isOpen,
  onClose,
  form,
  mode: propMode,
  maxPlayers: propMaxPlayers,
  players: propPlayers,
  loading: propLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch submissions if a tournament form is passed
  const formId = form?.id;
  const { submissions, loading: subsLoading } = useFormSubmissions(isOpen && formId ? formId : null);

  // Normalize mode: 'Solo' | 'Duo' | 'Squad'
  const mode = useMemo(() => {
    if (propMode) return propMode;
    const raw = form?.teamType || 'solo';
    const lower = raw.toLowerCase();
    if (lower === 'squad') return 'Squad';
    if (lower === 'duo') return 'Duo';
    return 'Solo';
  }, [propMode, form]);

  // Max players limit
  const maxPlayers = useMemo(() => {
    if (propMaxPlayers) return propMaxPlayers;
    if (form?.maxRegistrations && form.maxRegistrations !== 'unlimited') {
      return Number(form.maxRegistrations);
    }
    return 100;
  }, [propMaxPlayers, form]);

  const loading = propLoading !== undefined ? propLoading : (formId ? subsLoading : false);

  // Compute active players list from real submissions or sample starter data
  const players = useMemo(() => {
    if (propPlayers && propPlayers.length > 0) {
      return propPlayers;
    }

    if (submissions && submissions.length > 0) {
      return submissions.map((sub, idx) => {
        const leader = sub.players?.[0] || {};
        const teammates = (sub.players || []).slice(1).map((tm) => ({
          username: tm.nickname || 'Teammate',
          gameUid: String(tm.uid || 'N/A'),
        }));

        const playerRank = leader.rank || sub.minBRRank || 'Heroic';
        const teamName = sub.teamName || (mode === 'Solo' ? leader.nickname : `Team #${idx + 1}`);
        const leaderName = leader.nickname || sub.userName || `Player 1`;

        return {
          uid: sub.id || String(idx),
          teamName: teamName,
          leaderName: leaderName,
          username: mode === 'Solo' ? leaderName : teamName,
          gameUid: String(leader.uid || 'N/A'),
          rank: playerRank,
          status: sub.status || 'pending',
          teammates,
        };
      });
    }

    // Fallback for default starter forms so demo looks active
    const isStarterForm = ['ff-weekly-squad', 'ff-solo-arena', 'ff-duo-craftland'].includes(formId);
    if (isStarterForm) {
      if (mode === 'Squad') return SAMPLE_SQUAD_PLAYERS;
      if (mode === 'Duo') return SAMPLE_DUO_PLAYERS;
      return SAMPLE_SOLO_PLAYERS;
    }

    return [];
  }, [propPlayers, submissions, formId, mode]);

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    const q = searchQuery.toLowerCase().trim();
    return players.filter((p) => {
      const matchUser = p.username?.toLowerCase().includes(q);
      const matchTeam = p.teamName?.toLowerCase().includes(q);
      const matchLeader = p.leaderName?.toLowerCase().includes(q);
      const matchUid = String(p.gameUid || '').toLowerCase().includes(q);
      const matchRank = p.rank?.toLowerCase().includes(q);
      const matchStatus = p.status?.toLowerCase().includes(q);
      const matchTeammate = p.teammates?.some(
        (t) => t.username?.toLowerCase().includes(q) || String(t.gameUid || '').toLowerCase().includes(q)
      );
      return matchUser || matchTeam || matchLeader || matchUid || matchRank || matchStatus || matchTeammate;
    });
  }, [players, searchQuery]);

  // Lock body scroll & handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset search when opening/closing
  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="roster-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Bottom Sheet Modal Container */}
      <div
        className="roster-modal-container"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          background: '#0D1526',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
          animation: 'rosterSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Top Drag Handle */}
        <div
          style={{
            width: '36px',
            height: '4px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '99px',
            margin: '10px auto 0',
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#F1F5F9', letterSpacing: '-0.01em' }}>
              Match Roster ({mode} Mode)
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
              {form?.formName ? (
                <span style={{ color: '#94A3B8', marginRight: '6px' }}>{form.formName} &bull;</span>
              ) : null}
              Joined: <span style={{ color: '#FACC15', fontWeight: 700 }}>{players.length}</span> / {maxPlayers}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close roster"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'background 0.2s',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Optional Search Bar if players exist */}
        {players.length > 3 && (
          <div style={{ padding: '10px 18px 0 18px', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search player, team, UID, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  outline: 'none',
                }}
              />
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Player List Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#FACC15', fontSize: '0.9rem' }}>
              Loading registered players...
            </div>
          ) : players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748B' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
              <div style={{ fontSize: '0.85rem' }}>No players have joined this match yet.</div>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
              <div style={{ fontSize: '0.85rem' }}>No players match &ldquo;{searchQuery}&rdquo;</div>
            </div>
          ) : mode === 'Solo' ? (
            /* ═════════════════ SOLO MODE ═════════════════ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredPlayers.map((player, idx) => (
                <div
                  key={player.uid || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(124, 58, 237, 0.18)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 800, width: '24px', textAlign: 'center', flexShrink: 0 }}>
                      #{idx + 1}
                    </span>
                    <img
                      src={getRankIcon(player.rank)}
                      alt={player.rank || 'Rank'}
                      style={{
                        width: '38px',
                        height: '38px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/assets/ranks/heroic.webp';
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FACC15', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {player.username}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '1px', fontFamily: 'monospace' }}>
                        UID: {player.gameUid}
                      </div>
                    </div>
                  </div>
                  {renderStatusText(player.status)}
                </div>
              ))}
            </div>
          ) : mode === 'Duo' ? (
            /* ═════════════════ DUO MODE ═════════════════ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredPlayers.map((team, idx) => (
                <div
                  key={team.uid || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid rgba(124, 58, 237, 0.25)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Left Purple Rank Strip */}
                  <div
                    style={{
                      width: '42px',
                      background: '#7C3AED',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      fontSize: '0.98rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    #{idx + 1}
                  </div>

                  {/* Right Content */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {/* Leader Row */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(27, 36, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                        backgroundColor: '#1B243B',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <img
                          src={getRankIcon(team.rank)}
                          alt={team.rank || 'Rank'}
                          style={{
                            width: '38px',
                            height: '38px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.currentTarget.src = '/assets/ranks/heroic.webp';
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#FACC15', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {team.teamName || team.username}
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {team.leaderName || team.username}
                          </div>
                          <div style={{ fontSize: '0.66rem', color: '#94A3B8', fontFamily: 'monospace', marginTop: '1px' }}>
                            UID: {team.gameUid}
                          </div>
                        </div>
                      </div>
                      {renderStatusText(team.status)}
                    </div>

                    {/* Teammate Row */}
                    <div
                      style={{
                        background: '#1F123C',
                        padding: '6px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {team.teammates && team.teammates[0] ? (
                        <>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {team.teammates[0].username}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace', marginLeft: '8px' }}>
                            UID: {team.teammates[0].gameUid}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#64748B', fontStyle: 'italic' }}>
                          No Teammate registered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ═════════════════ SQUAD MODE ═════════════════ */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPlayers.map((team, idx) => (
                <div
                  key={team.uid || idx}
                  style={{
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(124, 58, 237, 0.25)',
                  }}
                >
                  {/* Squad Leader Row */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(27, 36, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                      backgroundColor: '#1B243B',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#FFFFFF', minWidth: '24px', flexShrink: 0 }}>
                        #{idx + 1}
                      </span>
                      <img
                        src={getRankIcon(team.rank)}
                        alt={team.rank || 'Rank'}
                        style={{
                          width: '38px',
                          height: '38px',
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/assets/ranks/heroic.webp';
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#FACC15', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {team.teamName || team.username}
                        </div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFFFFF', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {team.leaderName || team.username}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#94A3B8', fontFamily: 'monospace', marginTop: '1px' }}>
                          UID: {team.gameUid}
                        </div>
                      </div>
                    </div>
                    {renderStatusText(team.status)}
                  </div>

                  {/* Teammates 3-Column Grid (Slots 2, 3, 4) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', background: '#0D1526' }}>
                    {[0, 1, 2].map((tIdx) => {
                      const mate = team.teammates ? team.teammates[tIdx] : null;
                      return (
                        <div
                          key={tIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'stretch',
                            background: '#1F123C',
                            borderRight: tIdx < 2 ? '1px solid rgba(124, 58, 237, 0.15)' : 'none',
                            minWidth: 0,
                          }}
                        >
                          {/* Number Badge (2, 3, 4) */}
                          <div
                            style={{
                              width: '24px',
                              background: '#581C87',
                              color: '#FFFFFF',
                              fontWeight: 'bold',
                              fontSize: '0.78rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {tIdx + 2}
                          </div>

                          {/* Teammate Name & UID */}
                          <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {mate ? mate.username : '---'}
                            </span>
                            <span style={{ fontSize: '0.58rem', color: '#94A3B8', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {mate ? mate.gameUid : '---'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Close Roster
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rosterSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media (min-width: 640px) {
          .roster-modal-backdrop {
            align-items: center !important;
            padding: 20px;
          }
          .roster-modal-container {
            border-radius: 16px !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6) !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RegisteredPlayersModal;
