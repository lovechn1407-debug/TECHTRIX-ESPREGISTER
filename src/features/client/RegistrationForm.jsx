import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Users,
  User,
  Phone,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  LogIn,
  PartyPopper,
  Flame,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  useFormDetails,
  checkDuplicateUIDs,
  submitRegistration,
} from '../../hooks/useFirebase';
import { fetchFreeFirePlayer } from '../../lib/freefire';
import { uploadImageToImgBB } from '../../lib/imgbb';
import { RANK_NAMES, getMinPointsForRank, getRankFromPoints } from '../../utils/ranks';
import { validateWhatsApp, validateUID, isFormClosed, isSlotsFull } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FileUpload from '../../components/ui/FileUpload';
import PlayerCard from '../../components/ui/PlayerCard';
import Loading from '../../components/common/Loading';
import { database } from '../../lib/firebase';
import { ref, get } from 'firebase/database';

export function RegistrationForm() {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const editSubmissionId = searchParams.get('editSubmissionId');

  const { user, loginWithGoogle } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const navigate = useNavigate();

  const { form, loading: formLoading } = useFormDetails(formId);

  // Form State
  const [teamName, setTeamName] = useState('');
  const [teamLogoFile, setTeamLogoFile] = useState(null);
  const [teamLogoPreview, setTeamLogoPreview] = useState('');
  const [teamLogoUrl, setTeamLogoUrl] = useState('');

  // Players State
  const [players, setPlayers] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState(0); // For squad
  const [fetchLoading, setFetchLoading] = useState({}); // { [playerIndex]: boolean }
  const [playerErrors, setPlayerErrors] = useState({}); // { [playerIndex]: { uid: '', whatsapp: '', ... } }

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdSubId, setCreatedSubId] = useState(null);
  const [reEditDataLoaded, setReEditDataLoaded] = useState(false);

  // Determine player count from form teamType
  const getPlayerCount = (type) => {
    const t = (type || 'solo').toLowerCase();
    if (t === 'duo') return 2;
    if (t === 'squad') return 4;
    return 1;
  };

  // Initialize players structure based on teamType
  useEffect(() => {
    if (form && !reEditDataLoaded) {
      const count = getPlayerCount(form.teamType);
      const initial = Array.from({ length: count }, (_, i) => ({
        index: i,
        uid: '',
        nickname: '',
        level: '',
        rank: form.minBRRank || 'Bronze',
        rankPoints: 0,
        region: 'IND',
        whatsapp: '',
        profileImageFile: null,
        profileImagePreview: '',
        profileImageUrl: '',
        apiVerified: false,
        isFetched: false,
        isConfirmed: false,
        isWrongInfo: false,
        fetchedData: null,
      }));
      setPlayers(initial);
    }
  }, [form, reEditDataLoaded]);

  // Handle Re-edit Mode: fetch existing submission data
  useEffect(() => {
    async function loadReEditData() {
      if (!editSubmissionId || !formId) return;
      try {
        const subRef = ref(database, `submissions/${formId}/${editSubmissionId}`);
        const snap = await get(subRef);
        if (snap.exists()) {
          const data = snap.val();
          setTeamName(data.teamName || '');
          setTeamLogoUrl(data.teamLogo || '');
          setTeamLogoPreview(data.teamLogo || '');

          if (data.players && Array.isArray(data.players)) {
            const mapped = data.players.map((p, idx) => ({
              index: idx,
              uid: p.uid || '',
              nickname: p.nickname || '',
              level: p.level || '',
              rank: p.rank || form?.minBRRank || 'Bronze',
              rankPoints: p.rankPoints || 0,
              region: p.region || 'IND',
              whatsapp: p.whatsapp || '',
              profileImageFile: null,
              profileImagePreview: p.profileImage || '',
              profileImageUrl: p.profileImage || '',
              apiVerified: Boolean(p.apiVerified),
              isFetched: Boolean(p.apiVerified),
              isConfirmed: Boolean(p.apiVerified),
              isWrongInfo: !p.apiVerified,
              fetchedData: null,
            }));
            setPlayers(mapped);
          }
          setReEditDataLoaded(true);
          showInfo('Editing previously declined submission. You can update and resubmit.', 'Re-edit Mode');
        }
      } catch (err) {
        console.error('Error loading re-edit data:', err);
      }
    }
    loadReEditData();
  }, [editSubmissionId, formId, form, showInfo]);

  // Update a single player field
  const updatePlayer = (index, updates) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });

    // Clear field error
    if (playerErrors[index]) {
      setPlayerErrors((prev) => ({
        ...prev,
        [index]: {},
      }));
    }
  };

  // Fetch Free Fire Player info via API
  const handleFetchPlayer = async (index) => {
    const p = players[index];
    if (!validateUID(p.uid)) {
      setPlayerErrors((prev) => ({
        ...prev,
        [index]: { ...prev[index], uid: 'Please enter a valid Game UID (6-12 digits)' },
      }));
      return;
    }

    setFetchLoading((prev) => ({ ...prev, [index]: true }));

    try {
      const data = await fetchFreeFirePlayer(p.uid, 'IND');

      updatePlayer(index, {
        isFetched: true,
        fetchedData: data,
        isConfirmed: false,
        isWrongInfo: false,
      });
      showSuccess(`Player profile found for ${data.nickname}`, 'Verification Found');
    } catch (err) {
      showError(err.message || 'Could not verify UID. You may enter details manually.', 'API Verification Notice');
      updatePlayer(index, {
        isFetched: false,
        isWrongInfo: true, // fallback to manual entry
      });
    } finally {
      setFetchLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Confirm API Fetched Player Info
  const handleConfirmPlayer = (index) => {
    const p = players[index];
    if (!p.fetchedData) return;

    const data = p.fetchedData;
    updatePlayer(index, {
      nickname: data.nickname,
      level: data.level,
      rank: data.rankName,
      rankPoints: data.rankingPoints,
      region: data.region,
      apiVerified: true,
      isConfirmed: true,
      isWrongInfo: false,
    });
    showSuccess(`Verified ${data.nickname}`, 'Player Confirmed');
  };

  // Reject / Wrong Information flow
  const handleWrongInfo = (index) => {
    updatePlayer(index, {
      nickname: '',
      level: '',
      rank: form.minBRRank || 'Bronze',
      rankPoints: 0,
      apiVerified: false,
      isConfirmed: false,
      isWrongInfo: true,
      fetchedData: null,
      isFetched: false,
    });
    showInfo('Manual entry enabled. Please fill details and upload a profile screenshot.', 'Manual Mode');
  };

  // Validate entire form before submission
  const validateForm = async () => {
    const errors = {};
    let hasError = false;

    const isTeam = form.teamType === 'duo' || form.teamType === 'squad';

    if (isTeam && !teamName.trim()) {
      showError('Please enter a team name.', 'Missing Team Name');
      return false;
    }

    if (isTeam && form.requireTeamLogo && !teamLogoUrl && !teamLogoFile) {
      showError('Please upload a team logo.', 'Missing Team Logo');
      return false;
    }

    const minLevel = Number(form.minLevel || 1);
    const minRankPoints = Number(form.minBRRankPoints || getMinPointsForRank(form.minBRRank));
    const allEnteredUids = [];

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const pErr = {};

      if (!validateUID(p.uid)) {
        pErr.uid = 'Valid UID required';
        hasError = true;
      }

      if (!p.nickname.trim()) {
        pErr.nickname = 'Player name is required';
        hasError = true;
      }

      const pLevel = Number(p.level);
      if (!pLevel || pLevel < minLevel) {
        pErr.level = `Minimum level requirement is ${minLevel}`;
        hasError = true;
      }

      // Rank eligibility check
      const playerRankPts = Number(p.rankPoints) || getMinPointsForRank(p.rank);
      if (playerRankPts < minRankPoints) {
        pErr.rank = `Rank must be at least ${form.minBRRank}`;
        hasError = true;
      }

      // WhatsApp check
      if (!validateWhatsApp(p.whatsapp)) {
        pErr.whatsapp = 'Enter a valid 10-digit Indian WhatsApp number';
        hasError = true;
      }

      // Image upload requirement check
      const imageRequired =
        form.requirePlayerImages ||
        p.isWrongInfo ||
        form.verificationMethod === 'manual';

      if (imageRequired && !p.profileImageUrl && !p.profileImageFile) {
        pErr.profileImage = 'Profile screenshot is required';
        hasError = true;
      }

      // Check within-team duplicate UID
      if (p.uid && allEnteredUids.includes(String(p.uid).trim())) {
        pErr.uid = 'Same UID entered more than once in this team';
        hasError = true;
      }
      if (p.uid) {
        allEnteredUids.push(String(p.uid).trim());
      }

      errors[i] = pErr;
    }

    setPlayerErrors(errors);

    if (hasError) {
      showError('Please correct the errors in the form before submitting.', 'Validation Error');
      return false;
    }

    // Anti-duplicacy check against database submissions
    if (form.duplicacyCheck && !editSubmissionId) {
      try {
        const duplicateFound = await checkDuplicateUIDs(formId, allEnteredUids);
        if (duplicateFound) {
          showError(
            `UID ${duplicateFound} is already registered in this tournament. Duplicate registrations are strictly forbidden.`,
            'Duplicate Entry Blocked'
          );
          return false;
        }
      } catch (err) {
        console.error('Duplicacy check error:', err);
      }
    }

    return true;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showError('You must be signed in with Google to submit registration.', 'Sign In Required');
      return;
    }

    const isValid = await validateForm();
    if (!isValid) return;

    setSubmitting(true);

    try {
      // 1. Upload Team Logo if present and not yet hosted
      let finalTeamLogo = teamLogoUrl;
      if (teamLogoFile && !finalTeamLogo) {
        finalTeamLogo = await uploadImageToImgBB(teamLogoFile);
        setTeamLogoUrl(finalTeamLogo);
      }

      // 2. Upload any player profile images to ImgBB
      const preparedPlayers = [];
      for (const p of players) {
        let finalPlayerImg = p.profileImageUrl;
        if (p.profileImageFile && !finalPlayerImg) {
          finalPlayerImg = await uploadImageToImgBB(p.profileImageFile);
        }

        preparedPlayers.push({
          uid: String(p.uid).trim(),
          nickname: p.nickname.trim(),
          level: Number(p.level),
          rank: p.rank,
          rankPoints: Number(p.rankPoints) || getMinPointsForRank(p.rank),
          region: p.region || 'IND',
          whatsapp: String(p.whatsapp).replace(/\D/g, ''),
          profileImage: finalPlayerImg || null,
          apiVerified: Boolean(p.apiVerified),
        });
      }

      // 3. Assemble submission payload
      const submissionData = {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Player',
        teamName: form.teamType === 'solo' ? players[0].nickname : teamName.trim(),
        teamLogo: finalTeamLogo || null,
        players: preparedPlayers,
      };

      // 4. Submit to Firebase RTDB
      const subId = await submitRegistration({
        formId,
        submissionData,
        userId: user.uid,
        isReEdit: Boolean(editSubmissionId),
        submissionId: editSubmissionId || null,
      });

      setCreatedSubId(subId);
      setIsSuccess(true);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Confetti fallback
      }

      showSuccess('Your tournament registration has been submitted successfully!', 'Registration Received');
    } catch (error) {
      console.error('Submission failed:', error);
      showError(error.message || 'Failed to submit registration. Please try again.', 'Submission Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (formLoading) {
    return <Loading message="Loading tournament registration form..." fullPage />;
  }

  if (!form) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h3>Registration Form Unavailable</h3>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          This tournament registration does not exist or has been removed.
        </p>
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/')}>
          Browse Tournaments
        </Button>
      </div>
    );
  }

  // Check if form is closed or full (unless in re-edit mode)
  if (!editSubmissionId) {
    if (isFormClosed(form)) {
      return (
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>Registration Closed</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            The registration deadline for this tournament has passed.
          </p>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/')}>
            Back to Tournaments
          </Button>
        </div>
      );
    }

    if (isSlotsFull(form)) {
      return (
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <ShieldAlert size={48} color="var(--warning)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>Tournament Slots Full</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            All available slots for this tournament have been claimed.
          </p>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/')}>
            Back to Tournaments
          </Button>
        </div>
      );
    }
  }

  // Auth Gate: user must sign in with Google
  if (!user) {
    return (
      <div className="container">
        <div className="auth-gate-card">
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(108, 92, 231, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
            }}
          >
            <LogIn size={28} />
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Sign In Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Please sign in with your Google account to register for <strong>{form.formName}</strong> and track your registration status.
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={LogIn}
            fullWidth
            onClick={loginWithGoogle}
          >
            Sign In with Google
          </Button>
        </div>
      </div>
    );
  }

  // Success Celebration View
  if (isSuccess) {
    return (
      <div className="container">
        <div className="success-card">
          <div className="success-icon-box">
            <CheckCircle2 size={44} />
          </div>
          <h2 style={{ marginBottom: '0.75rem' }}>Registration Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Your entry for <strong>{form.formName}</strong> has been received and entered into review. You can track updates in real-time on your status timeline.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/status')}
            >
              View Registration Status
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isTeam = form.teamType === 'duo' || form.teamType === 'squad';

  return (
    <div className="registration-container">
      {/* Back button and Form Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <Link
          to={`/form/${formId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} />
          <span>Tournament Details</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="card-game-badge">
            <Flame size={13} />
            <span>{form.gameTitle || form.gameName || 'Free Fire MAX'}</span>
          </span>
          <span className="tag-mono">{form.teamType ? form.teamType.toUpperCase() : 'SOLO'}</span>
        </div>
        <h1>{form.formName} Registration</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Min Level: <strong>{form.minLevel || 1}</strong> | Min Rank: <strong>{form.minBRRank || 'Bronze'}</strong> | Mode: <strong>{form.gameMode || 'BR-DEFAULT'}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* TEAM INFO SECTION (Duo / Squad) */}
        {isTeam && (
          <div className="form-section-card">
            <div className="section-heading-row">
              <div className="section-heading-title">
                <Users size={20} color="var(--primary)" />
                <span>Team Details</span>
              </div>
            </div>

            <Input
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Phoenix Esports"
              required
            />

            {form.requireTeamLogo && (
              <FileUpload
                label="Team Logo"
                description="Upload square logo (PNG, JPG, WEBP)"
                required
                previewUrl={teamLogoPreview}
                uploadedUrl={teamLogoUrl}
                onFileSelect={(file) => {
                  setTeamLogoFile(file);
                  setTeamLogoPreview(URL.createObjectURL(file));
                }}
                onRemove={() => {
                  setTeamLogoFile(null);
                  setTeamLogoPreview('');
                  setTeamLogoUrl('');
                }}
              />
            )}
          </div>
        )}

        {/* PLAYERS SECTIONS */}
        {form.teamType === 'squad' ? (
          // Squad: Accordion Layout
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Squad Roster (4 Players)</h3>
            {players.map((p, idx) => {
              const isOpen = activeAccordion === idx;
              const isVerified = p.isConfirmed || (p.nickname && p.whatsapp);
              const pErr = playerErrors[idx] || {};

              return (
                <div key={idx} className="player-accordion">
                  <div
                    className={`player-accordion-header ${isOpen ? 'open' : ''}`}
                    onClick={() => setActiveAccordion(isOpen ? -1 : idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isVerified ? 'rgba(0, 184, 148, 0.15)' : 'rgba(108, 92, 231, 0.1)',
                          color: isVerified ? 'var(--success)' : 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                        }}
                      >
                        {isVerified ? <Check size={16} strokeWidth={3} /> : idx + 1}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                        Player {idx + 1} {p.nickname ? `(${p.nickname})` : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isVerified && (
                        <span style={{ color: 'var(--success)', fontSize: '0.78rem', fontWeight: 600 }}>
                          Ready
                        </span>
                      )}
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="player-accordion-body">
                      {renderPlayerFields(p, idx, pErr)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // Solo & Duo: Stacked Cards
          players.map((p, idx) => {
            const pErr = playerErrors[idx] || {};
            return (
              <div key={idx} className="form-section-card">
                <div className="section-heading-row">
                  <div className="section-heading-title">
                    <User size={20} color="var(--primary)" />
                    <span>{players.length > 1 ? `Player ${idx + 1} Details` : 'Player Details'}</span>
                  </div>
                  {p.apiVerified && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        color: 'var(--success)',
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle2 size={14} />
                      API Verified
                    </span>
                  )}
                </div>
                {renderPlayerFields(p, idx, pErr)}
              </div>
            );
          })
        )}

        {/* SUBMIT BUTTON */}
        <div style={{ marginTop: '2rem' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
          >
            {editSubmissionId ? 'Update & Re-submit Registration' : 'Confirm & Complete Registration'}
          </Button>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            By registering, you confirm all player information is accurate and matches Free Fire in-game records.
          </p>
        </div>
      </form>
    </div>
  );

  // Helper to render fields for an individual player
  function renderPlayerFields(p, idx, pErr) {
    const isApiMode = form.verificationMethod !== 'manual';
    const requireImg =
      form.requirePlayerImages ||
      p.isWrongInfo ||
      !isApiMode ||
      form.verificationMethod === 'manual';

    return (
      <div>
        {/* Game UID + Fetch Button */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Free Fire Game UID"
              value={p.uid}
              onChange={(e) => updatePlayer(idx, { uid: e.target.value.replace(/\D/g, '') })}
              placeholder="e.g. 123456789"
              mono
              required
              error={pErr.uid}
              disabled={p.isConfirmed}
            />
          </div>
          {isApiMode && !p.isConfirmed && (
            <Button
              variant="secondary"
              icon={Search}
              onClick={() => handleFetchPlayer(idx)}
              loading={fetchLoading[idx]}
              style={{ height: '54px', padding: '0 1.25rem' }}
            >
              Fetch
            </Button>
          )}
        </div>

        {/* Fetched Player Card preview */}
        {p.isFetched && p.fetchedData && (
          <PlayerCard
            playerData={p.fetchedData}
            isConfirmed={p.isConfirmed}
            onConfirm={() => handleConfirmPlayer(idx)}
            onReject={() => handleWrongInfo(idx)}
          />
        )}

        {/* Player Name / Nickname */}
        <Input
          label="Player Nickname / In-Game Name"
          value={p.nickname}
          onChange={(e) => updatePlayer(idx, { nickname: e.target.value })}
          placeholder="e.g. ShadowHunter"
          required
          readOnly={p.isConfirmed}
          error={pErr.nickname}
        />

        {/* Level and Rank row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Game Level"
            type="number"
            value={p.level}
            onChange={(e) => updatePlayer(idx, { level: e.target.value })}
            placeholder="e.g. 55"
            required
            readOnly={p.isConfirmed}
            error={pErr.level}
          />

          <Select
            label="BR Rank"
            value={p.rank}
            onChange={(e) => updatePlayer(idx, { rank: e.target.value })}
            options={RANK_NAMES}
            required
            disabled={p.isConfirmed}
            error={pErr.rank}
          />
        </div>

        {/* Profile Image upload if required or fallback */}
        {requireImg && (
          <FileUpload
            label="Player Profile Screenshot"
            description="Screenshot showing UID and in-game profile"
            required
            previewUrl={p.profileImagePreview}
            uploadedUrl={p.profileImageUrl}
            error={pErr.profileImage}
            onFileSelect={(file) => {
              updatePlayer(idx, {
                profileImageFile: file,
                profileImagePreview: URL.createObjectURL(file),
              });
            }}
            onRemove={() => {
              updatePlayer(idx, {
                profileImageFile: null,
                profileImagePreview: '',
                profileImageUrl: '',
              });
            }}
          />
        )}

        {/* Contact WhatsApp */}
        <Input
          label="WhatsApp Number (10 digits)"
          type="tel"
          value={p.whatsapp}
          onChange={(e) => updatePlayer(idx, { whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) })}
          placeholder="e.g. 9876543210"
          required
          error={pErr.whatsapp}
          rightElement={
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              +91
            </span>
          }
        />
      </div>
    );
  }
}

export default RegistrationForm;
