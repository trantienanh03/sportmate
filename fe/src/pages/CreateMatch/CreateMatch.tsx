import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import './CreateMatch.css';

import footballIcon from '../../assets/ion--football.svg';
import badmintonIcon from '../../assets/mdi--badminton.svg';
import tennisIcon from '../../assets/emojione--tennis.svg';
import pickleballIcon from '../../assets/material-symbols--pickleball.svg';
import basketballIcon from '../../assets/emojione--basketball.svg';
import tableTennisIcon from '../../assets/uil--table-tennis.svg';
import esportsIcon from '../../assets/material-symbols--sports-esports.svg';
import volleyballIcon from '../../assets/mdi--volleyball.svg';

const SPORTS = [
  { id: 'football', label: 'Football', icon: footballIcon },
  { id: 'badminton', label: 'Badminton', icon: badmintonIcon },
  { id: 'tennis', label: 'Tennis', icon: tennisIcon },
  { id: 'pickleball', label: 'Pickleball', icon: pickleballIcon },
  { id: 'basketball', label: 'Basketball', icon: basketballIcon },
  { id: 'tabletennis', label: 'Table Tennis', icon: tableTennisIcon },
  { id: 'esports', label: 'Esports', icon: esportsIcon },
  { id: 'volleyball', label: 'Volleyball', icon: volleyballIcon },
];

const SKILL_LEVELS = [
  { id: 'newbie', label: 'Newbie' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'all', label: 'All Levels' },
];

const TIPS = [
  {
    title: 'Pick your sport',
    body: 'Choose the sport you want to play. This helps players with the right skill set find your match quickly.',
  },
  {
    title: 'Schedule it right',
    body: 'Weekday evenings (6–9 PM) and weekend mornings are peak times. Pick a slot when most players are free.',
  },
  {
    title: 'Almost there!',
    body: 'Keep your title short and clear. A good description helps players know what to expect.',
  },
];

interface FormData {
  sport: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  title: string;
  maxPlayers: number;
  skillLevel: string;
  feeType: 'free' | 'paid';
  fee: string;
  description: string;
}

const INITIAL_FORM: FormData = {
  sport: '',
  date: '',
  startTime: '19:00',
  endTime: '21:00',
  location: '',
  title: '',
  maxPlayers: 4,
  skillLevel: 'beginner',
  feeType: 'free',
  fee: '',
  description: '',
};

const formatDate = (d: string) => {
  if (!d) return null;
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (t: string) => {
  if (!t) return null;
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const PreviewCard: React.FC<{ form: FormData; step: number }> = ({ form, step }) => {
  const sport = SPORTS.find(s => s.id === form.sport);
  if (!sport) return null;

  return (
    <div className="cm-preview-card">
      <p className="cm-preview-title">Match Preview</p>

      <div className="cm-preview-row">
        <i className="fa-solid fa-futbol"></i>
        <div>
          <div className="cm-preview-row-label">Sport</div>
          <span className="cm-preview-sport-badge">
            {sport.label}
          </span>
        </div>
      </div>

      {step >= 2 && form.date && (
        <div className="cm-preview-row">
          <i className="fa-regular fa-calendar"></i>
          <div>
            <div className="cm-preview-row-label">Date & Time</div>
            <div className="cm-preview-row-value">{formatDate(form.date)}</div>
            {form.startTime && form.endTime && (
              <div className="cm-preview-row-label">
                {formatTime(form.startTime)} → {formatTime(form.endTime)}
              </div>
            )}
          </div>
        </div>
      )}

      {step >= 2 && form.location && (
        <div className="cm-preview-row">
          <i className="fa-solid fa-location-dot"></i>
          <div>
            <div className="cm-preview-row-label">Location</div>
            <div className="cm-preview-row-value" style={{ fontSize: '0.82rem' }}>{form.location}</div>
          </div>
        </div>
      )}

      {step === 3 && form.maxPlayers && (
        <div className="cm-preview-row">
          <i className="fa-solid fa-users"></i>
          <div>
            <div className="cm-preview-row-label">Players</div>
            <div className="cm-preview-row-value">{form.maxPlayers} players · {form.skillLevel}</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="cm-preview-row">
          <i className="fa-solid fa-tag"></i>
          <div>
            <div className="cm-preview-row-label">Entry fee</div>
            <div className="cm-preview-row-value">
              {form.feeType === 'free' ? 'Free' : (form.fee ? `${Number(form.fee).toLocaleString()} VND` : 'Paid')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);

  const set = (key: keyof FormData, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const canGoNext = () => {
    if (step === 1) return form.sport !== '';
    if (step === 2) return form.date !== '' && form.startTime !== '' && form.endTime !== '';
    return form.title.trim() !== '';
  };

  const handleSubmit = () => {
    console.log('Submitting match:', form);
    navigate('/home');
  };

  const tip = TIPS[step - 1];
  const showPreview = form.sport !== '';

  return (
    <div className="create-match-page">
      <LoggedInNavbar />

      <div className="cm-shell container py-5">
        <div className="row justify-content-center g-5">

          <div className="col-lg-6 col-md-8">
            <div className="cm-form-card">
              <div className="cm-progress-bar mb-5">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`cm-progress-segment ${s <= step ? 'filled' : ''}`} />
                ))}
              </div>

              {step > 1 && (
                <button className="cm-back-btn mb-4" onClick={() => setStep(s => s - 1)}>
                  <i className="fa-solid fa-arrow-left me-2"></i> Back
                </button>
              )}

              {step === 1 && <Step1 form={form} set={set} />}
              {step === 2 && <Step2 form={form} set={set} />}
              {step === 3 && <Step3 form={form} set={set} />}

              <div className="mt-4">
                {step < 3 ? (
                  <button
                    className={`btn cm-next-btn w-100 ${canGoNext() ? 'active' : ''}`}
                    disabled={!canGoNext()}
                    onClick={() => setStep(s => s + 1)}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className={`btn cm-submit-btn w-100 ${canGoNext() ? 'active' : ''}`}
                    disabled={!canGoNext()}
                    onClick={handleSubmit}
                  >
                    Create Match
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <div className="cm-right-panel">
              <div className="cm-tip-card">
                <h6 className="fw-bold mb-1">{tip.title}</h6>
                <p className="mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{tip.body}</p>
              </div>

              {showPreview && <PreviewCard form={form} step={step} />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const Step1: React.FC<{ form: FormData; set: (k: keyof FormData, v: string | number) => void }> = ({ form, set }) => (
  <div>
    <p className="letter-spacing mb-1" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
      Step 1 of 3
    </p>
    <h2 className="cm-step-title">What sport do you want to play?</h2>
    <div className="cm-sport-grid mt-4">
      {SPORTS.map(sport => (
        <button
          key={sport.id}
          className={`cm-sport-card ${form.sport === sport.id ? 'selected' : ''}`}
          onClick={() => set('sport', sport.id)}
        >
          <span className="cm-sport-icon-wrapper">
            <img
              src={sport.icon}
              alt={sport.label}
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
            />
          </span>
          <span className="cm-sport-label">{sport.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const Step2: React.FC<{ form: FormData; set: (k: keyof FormData, v: string | number) => void }> = ({ form, set }) => (
  <div>
    <p className="letter-spacing mb-1" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
      Step 2 of 3
    </p>
    <h2 className="cm-step-title">When and where?</h2>

    <div className="cm-field-group mt-4">
      <label className="cm-label">
        <i className="fa-regular fa-calendar me-2" style={{ color: 'var(--text-muted)' }}></i>Date
      </label>
      <input
        type="date"
        className="cm-input"
        value={form.date}
        min={new Date().toISOString().split('T')[0]}
        onChange={e => set('date', e.target.value)}
      />
    </div>

    <div className="cm-time-row mt-3">
      <div className="cm-field-group">
        <label className="cm-label">
          <i className="fa-regular fa-clock me-2" style={{ color: 'var(--text-muted)' }}></i>Start time
        </label>
        <input type="time" className="cm-input" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
      </div>
      <span className="cm-time-separator">to</span>
      <div className="cm-field-group">
        <label className="cm-label">End time</label>
        <input type="time" className="cm-input" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
      </div>
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">
        <i className="fa-solid fa-location-dot me-2" style={{ color: 'var(--text-muted)' }}></i>Venue / Location
      </label>
      <input
        type="text"
        className="cm-input"
        placeholder="e.g. Sân Cầu Lông Phú Nhuận, 123 Phan Xích Long"
        value={form.location}
        onChange={e => set('location', e.target.value)}
      />
    </div>
  </div>
);

const Step3: React.FC<{ form: FormData; set: (k: keyof FormData, v: string | number) => void }> = ({ form, set }) => (
  <div>
    <p className="letter-spacing mb-1" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
      Step 3 of 3
    </p>
    <h2 className="cm-step-title">Match details</h2>

    <div className="cm-field-group mt-4">
      <label className="cm-label">Match title</label>
      <input
        type="text"
        className="cm-input"
        placeholder={`e.g. ${form.sport ? form.sport.charAt(0).toUpperCase() + form.sport.slice(1) : 'Football'} match in District 1`}
        value={form.title}
        maxLength={100}
        onChange={e => set('title', e.target.value)}
      />
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">
        <i className="fa-solid fa-users me-2" style={{ color: 'var(--text-muted)' }}></i>Players needed
      </label>
      <div className="cm-stepper">
        <button className="cm-stepper-btn" onClick={() => set('maxPlayers', Math.max(2, Number(form.maxPlayers) - 1))}>−</button>
        <span className="cm-stepper-value">{form.maxPlayers}</span>
        <button className="cm-stepper-btn" onClick={() => set('maxPlayers', Math.min(100, Number(form.maxPlayers) + 1))}>+</button>
        <span className="ms-3" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>players total (including you)</span>
      </div>
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">Skill level</label>
      <div className="cm-chip-group">
        {SKILL_LEVELS.map(lvl => (
          <button
            key={lvl.id}
            className={`cm-chip ${form.skillLevel === lvl.id ? 'selected' : ''}`}
            onClick={() => set('skillLevel', lvl.id)}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">
        <i className="fa-solid fa-tag me-2" style={{ color: 'var(--text-muted)' }}></i>Entry fee
      </label>
      <div className="cm-chip-group mb-2">
        <button className={`cm-chip ${form.feeType === 'free' ? 'selected' : ''}`} onClick={() => set('feeType', 'free')}>Free</button>
        <button className={`cm-chip ${form.feeType === 'paid' ? 'selected' : ''}`} onClick={() => set('feeType', 'paid')}>Paid</button>
      </div>
      {form.feeType === 'paid' && (
        <div className="cm-fee-input-wrapper">
          <input
            type="number"
            className="cm-input"
            placeholder="50000"
            value={form.fee}
            onChange={e => set('fee', e.target.value)}
          />
          <span className="cm-fee-suffix">VND / person</span>
        </div>
      )}
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">
        Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
      </label>
      <textarea
        className="cm-input cm-textarea"
        rows={3}
        placeholder="Tell players what to expect, what to bring, any rules..."
        value={form.description}
        onChange={e => set('description', e.target.value)}
      />
    </div>
  </div>
);

export default CreateMatch;
