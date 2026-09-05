import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Edit2,
  Gamepad2,
  Layers,
  Calendar,
  Shield,
  Users,
  Info,
} from 'lucide-react';
import { GAMES, GAME_MODES, TEAM_TYPES } from '../../utils/constants';
import { RANK_NAMES, getMinPointsForRank } from '../../utils/ranks';
import { createTournamentForm } from '../../hooks/useFirebase';
import { useToast } from '../../context/ToastContext';
import { formatDateTime, formatDate } from '../../utils/helpers';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import GameCard from '../../components/ui/GameCard';

const STEPS = ['Select Game', 'Basic Info', 'Game Settings', 'Additional Info', 'Review & Confirm'];

export function CreateForm() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form Configuration State
  const [formData, setFormData] = useState({
    // Step 1
    gameId: 'freefire',
    gameName: 'Free Fire',
    // Step 2
    formName: '',
    shortName: '',
    scheduleType: 'manual', // 'custom' | 'manual'
    closingTime: '',
    maxRegType: 'unlimited', // 'limited' | 'unlimited'
    maxRegistrations: 50,
    // Step 3
    gameTitle: 'Free Fire MAX',
    gameMode: 'BR-DEFAULT',
    teamType: 'solo', // 'solo' | 'duo' | 'squad'
    requireTeamLogo: false,
    requirePlayerImages: false,
    verificationMethod: 'api', // 'api' | 'manual'
    minLevel: 1,
    minBRRank: 'Bronze',
    duplicacyCheck: true,
    // Step 4
    tournamentDate: '',
  });

  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // If team type changes to solo, disable requireTeamLogo
      if (field === 'teamType' && value === 'solo') {
        updated.requireTeamLogo = false;
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Step Validations
  const validateCurrentStep = () => {
    const errs = {};
    if (currentStep === 1) {
      if (!formData.gameId) errs.gameId = 'Please select a game';
    } else if (currentStep === 2) {
      if (!formData.formName.trim()) errs.formName = 'Form name is required';
      if (!formData.shortName.trim()) errs.shortName = 'Short name is required';
      if (formData.scheduleType === 'custom' && !formData.closingTime) {
        errs.closingTime = 'Closing date & time is required';
      }
      if (formData.maxRegType === 'limited' && (!formData.maxRegistrations || Number(formData.maxRegistrations) <= 0)) {
        errs.maxRegistrations = 'Please specify a positive slots limit';
      }
    } else if (currentStep === 3) {
      if (!formData.gameTitle.trim()) errs.gameTitle = 'Game title is required';
      if (!formData.minLevel || Number(formData.minLevel) < 1) {
        errs.minLevel = 'Min level must be 1 or higher';
      }
    } else if (currentStep === 4) {
      if (!formData.tournamentDate) {
        errs.tournamentDate = 'Tournament date is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleCreateTournament = async () => {
    setSubmitting(true);
    try {
      const payload = {
        gameName: formData.gameName,
        formName: formData.formName.trim(),
        shortName: formData.shortName.trim(),
        scheduleType: formData.scheduleType,
        closingTime: formData.scheduleType === 'custom' ? new Date(formData.closingTime).getTime() : null,
        maxRegistrations: formData.maxRegType === 'limited' ? Number(formData.maxRegistrations) : 'unlimited',
        gameTitle: formData.gameTitle.trim(),
        gameMode: formData.gameMode,
        teamType: formData.teamType,
        requireTeamLogo: Boolean(formData.requireTeamLogo),
        requirePlayerImages: Boolean(formData.requirePlayerImages),
        verificationMethod: formData.verificationMethod,
        minLevel: Number(formData.minLevel),
        minBRRank: formData.minBRRank,
        minBRRankPoints: getMinPointsForRank(formData.minBRRank),
        duplicacyCheck: Boolean(formData.duplicacyCheck),
        tournamentDate: new Date(formData.tournamentDate).getTime(),
        additionalInfo: {
          minLevel: Number(formData.minLevel),
          minRank: formData.minBRRank,
        },
        status: 'open',
      };

      await createTournamentForm(payload);
      showSuccess(`Tournament form "${formData.formName}" created successfully!`, 'Tournament Created');
      navigate('/admin/forms');
    } catch (err) {
      console.error('Error creating tournament form:', err);
      showError(err.message || 'Failed to save tournament to database.', 'Creation Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wizard-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem' }}>Create Registration Form</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure tournament rules, eligibility thresholds, and player verification parameters.
        </p>
      </div>

      <div className="wizard-card">
        {/* Progress Stepper */}
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(step) => setCurrentStep(step)}
        />

        <div className="wizard-step-content">
          {/* STEP 1: SELECT GAME */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '0.35rem' }}>Step 1: Select Game</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Choose the esports title for this tournament registration.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                {GAMES.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isSelected={formData.gameId === game.id}
                    onSelect={() => {
                      updateField('gameId', game.id);
                      updateField('gameName', game.name);
                      // Auto-advance
                      setCurrentStep(2);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: BASIC INFO */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '0.35rem' }}>Step 2: Basic Information</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Set display title, identifier, registration window, and slot capacity.
              </p>

              <Input
                label="Tournament Form Name"
                value={formData.formName}
                onChange={(e) => updateField('formName', e.target.value)}
                placeholder="e.g. Weekly Free Fire Championship #1"
                required
                error={errors.formName}
              />

              <Input
                label="Short Name / Tag"
                value={formData.shortName}
                onChange={(e) => updateField('shortName', e.target.value)}
                placeholder="e.g. WFFC-1"
                mono
                required
                error={errors.shortName}
              />

              {/* Schedule Closing Time */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '0.65rem' }}>
                  Schedule Closing Time
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="scheduleType"
                      value="manual"
                      checked={formData.scheduleType === 'manual'}
                      onChange={() => updateField('scheduleType', 'manual')}
                    />
                    <span>Until I Close (Manual Toggle)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="scheduleType"
                      value="custom"
                      checked={formData.scheduleType === 'custom'}
                      onChange={() => updateField('scheduleType', 'custom')}
                    />
                    <span>Custom Date & Time</span>
                  </label>
                </div>

                {formData.scheduleType === 'custom' && (
                  <Input
                    label="Closing Date & Time"
                    type="datetime-local"
                    value={formData.closingTime}
                    onChange={(e) => updateField('closingTime', e.target.value)}
                    required
                    error={errors.closingTime}
                  />
                )}
              </div>

              {/* Max Registrations */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '0.65rem' }}>
                  Maximum Registrations / Slots
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="maxRegType"
                      value="unlimited"
                      checked={formData.maxRegType === 'unlimited'}
                      onChange={() => updateField('maxRegType', 'unlimited')}
                    />
                    <span>Unlimited Slots</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="maxRegType"
                      value="limited"
                      checked={formData.maxRegType === 'limited'}
                      onChange={() => updateField('maxRegType', 'limited')}
                    />
                    <span>Limited Slots</span>
                  </label>
                </div>

                {formData.maxRegType === 'limited' && (
                  <Input
                    label="Maximum Slot Limit"
                    type="number"
                    value={formData.maxRegistrations}
                    onChange={(e) => updateField('maxRegistrations', e.target.value)}
                    placeholder="50"
                    required
                    error={errors.maxRegistrations}
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 3: GAME SETTINGS */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '0.35rem' }}>Step 3: Game Settings & Verification</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Define format, minimum rank/level requirements, and verification mode.
              </p>

              <Input
                label="Game Title"
                value={formData.gameTitle}
                onChange={(e) => updateField('gameTitle', e.target.value)}
                placeholder="e.g. Free Fire MAX"
                required
                error={errors.gameTitle}
              />

              <Select
                label="Game Mode"
                value={formData.gameMode}
                onChange={(e) => updateField('gameMode', e.target.value)}
                options={GAME_MODES.map((m) => ({ value: m.id, label: m.label }))}
                required
              />

              {/* Team Type Cards */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, display: 'block', marginBottom: '0.65rem' }}>
                  Team Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {TEAM_TYPES.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => updateField('teamType', t.id)}
                      style={{
                        border: formData.teamType === t.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: formData.teamType === t.id ? 'rgba(108, 92, 231, 0.05)' : '#FFFFFF',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {t.count} Player{t.count > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkbox Options */}
              <div style={{ marginBottom: '1.5rem', background: '#FAFBFF', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <Checkbox
                  label="Require Team Logo"
                  description="Mandatory logo upload (only applicable for Duo and Squad; auto-disabled for Solo)"
                  checked={formData.requireTeamLogo && formData.teamType !== 'solo'}
                  disabled={formData.teamType === 'solo'}
                  onChange={(e) => updateField('requireTeamLogo', e.target.checked)}
                />

                <Checkbox
                  label="Require Player Images"
                  description="Requires player profile screenshots for each registered member"
                  checked={formData.requirePlayerImages}
                  onChange={(e) => updateField('requirePlayerImages', e.target.checked)}
                />

                <Checkbox
                  label="Duplicacy Check"
                  description="Check for duplicate players in this form's submissions (prevents same UID from registering twice)"
                  checked={formData.duplicacyCheck}
                  onChange={(e) => updateField('duplicacyCheck', e.target.checked)}
                />
              </div>

              {/* Verification Method Toggle Switch */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Player Verification Method</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formData.verificationMethod === 'api'
                        ? 'Players will be verified via Free Fire API'
                        : 'Players will enter details manually'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: formData.verificationMethod === 'api' ? 'var(--primary)' : 'var(--text-muted)' }}>
                      API Mode
                    </span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.verificationMethod === 'api'}
                        onChange={(e) => updateField('verificationMethod', e.target.checked ? 'api' : 'manual')}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Minimum Level & Rank */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Minimum Game Level"
                  type="number"
                  value={formData.minLevel}
                  onChange={(e) => updateField('minLevel', e.target.value)}
                  placeholder="1"
                  required
                  error={errors.minLevel}
                />

                <Select
                  label="Minimum BR Rank"
                  value={formData.minBRRank}
                  onChange={(e) => updateField('minBRRank', e.target.value)}
                  options={RANK_NAMES}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 4: ADDITIONAL INFO */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '0.35rem' }}>Step 4: Additional Tournament Info</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Information displayed to users on the registration card and details page.
              </p>

              <Input
                label="Tournament Date"
                type="date"
                value={formData.tournamentDate}
                onChange={(e) => updateField('tournamentDate', e.target.value)}
                required
                error={errors.tournamentDate}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <Input
                  label="Minimum Level (Read-Only)"
                  value={`Level ${formData.minLevel}`}
                  readOnly
                  disabled
                />

                <Input
                  label="Minimum Rank (Read-Only)"
                  value={formData.minBRRank}
                  readOnly
                  disabled
                />
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & CONFIRM */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '0.35rem' }}>Step 5: Review & Confirm</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Review all tournament settings before publishing to live registration.
              </p>

              {/* Game Section */}
              <div className="review-section">
                <div className="review-section-header">
                  <span style={{ fontWeight: 700 }}>Game Title</span>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setCurrentStep(1)}>
                    Edit
                  </Button>
                </div>
                <div className="review-section-body">
                  <div>
                    <div className="review-item-label">Selected Game</div>
                    <div className="review-item-value">{formData.gameName}</div>
                  </div>
                </div>
              </div>

              {/* Basic Info Section */}
              <div className="review-section">
                <div className="review-section-header">
                  <span style={{ fontWeight: 700 }}>Basic Information</span>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setCurrentStep(2)}>
                    Edit
                  </Button>
                </div>
                <div className="review-section-body">
                  <div>
                    <div className="review-item-label">Form Name</div>
                    <div className="review-item-value">{formData.formName}</div>
                  </div>
                  <div>
                    <div className="review-item-label">Short Name</div>
                    <div className="review-item-value">{formData.shortName}</div>
                  </div>
                  <div>
                    <div className="review-item-label">Closing Schedule</div>
                    <div className="review-item-value">
                      {formData.scheduleType === 'custom'
                        ? formatDateTime(formData.closingTime)
                        : 'Until Manually Closed'}
                    </div>
                  </div>
                  <div>
                    <div className="review-item-label">Max Slots</div>
                    <div className="review-item-value">
                      {formData.maxRegType === 'limited' ? `${formData.maxRegistrations} Slots` : 'Unlimited'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Settings Section */}
              <div className="review-section">
                <div className="review-section-header">
                  <span style={{ fontWeight: 700 }}>Game Settings & Rules</span>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setCurrentStep(3)}>
                    Edit
                  </Button>
                </div>
                <div className="review-section-body">
                  <div>
                    <div className="review-item-label">Mode & Format</div>
                    <div className="review-item-value" style={{ textTransform: 'capitalize' }}>
                      {formData.gameMode} ({formData.teamType})
                    </div>
                  </div>
                  <div>
                    <div className="review-item-label">Verification</div>
                    <div className="review-item-value" style={{ textTransform: 'uppercase' }}>
                      {formData.verificationMethod} Verification
                    </div>
                  </div>
                  <div>
                    <div className="review-item-label">Min Level / Rank</div>
                    <div className="review-item-value">
                      Level {formData.minLevel}+ / {formData.minBRRank}
                    </div>
                  </div>
                  <div>
                    <div className="review-item-label">Duplicacy Check</div>
                    <div className="review-item-value">
                      {formData.duplicacyCheck ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="review-section">
                <div className="review-section-header">
                  <span style={{ fontWeight: 700 }}>Tournament Schedule</span>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => setCurrentStep(4)}>
                    Edit
                  </Button>
                </div>
                <div className="review-section-body">
                  <div>
                    <div className="review-item-label">Tournament Date</div>
                    <div className="review-item-value">{formatDate(formData.tournamentDate)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation Actions */}
        <div className="wizard-actions">
          {currentStep > 1 ? (
            <Button variant="secondary" icon={ArrowLeft} onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length ? (
            <Button variant="primary" icon={ArrowRight} iconPosition="right" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              icon={Check}
              loading={submitting}
              onClick={handleCreateTournament}
            >
              Confirm & Create Tournament
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateForm;
