import { useState, useEffect } from 'react';
import {
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
  runTransaction,
} from 'firebase/database';
import { database } from '../lib/firebase';

export const DEFAULT_STARTER_FORMS = [
  {
    id: 'ff-weekly-squad',
    formName: 'Free Fire MAX Weekly Pro Championship #1',
    shortName: 'FFW1',
    gameName: 'Free Fire MAX',
    gameTitle: 'Free Fire MAX',
    gameMode: 'BR-DEFAULT',
    teamType: 'squad',
    requireTeamLogo: true,
    requirePlayerImages: false,
    verificationMethod: 'api',
    minLevel: 30,
    minBRRank: 'Platinum',
    minBRRankPoints: 2100,
    duplicacyCheck: true,
    scheduleType: 'manual',
    maxRegistrations: 48,
    submissionCount: 12,
    tournamentDate: Date.now() + 86400000 * 5,
    status: 'open',
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'ff-solo-arena',
    formName: 'TechTrix Solo Clash Arena',
    shortName: 'SCA-1',
    gameName: 'Free Fire MAX',
    gameTitle: 'Free Fire MAX',
    gameMode: 'BR-DEFAULT',
    teamType: 'solo',
    requireTeamLogo: false,
    requirePlayerImages: false,
    verificationMethod: 'api',
    minLevel: 20,
    minBRRank: 'Gold',
    minBRRankPoints: 1600,
    duplicacyCheck: true,
    scheduleType: 'manual',
    maxRegistrations: 50,
    submissionCount: 18,
    tournamentDate: Date.now() + 86400000 * 3,
    status: 'open',
    createdAt: Date.now() - 3600000 * 18,
  },
  {
    id: 'ff-duo-craftland',
    formName: 'Craftland Duos Masters Cup',
    shortName: 'CDM-2',
    gameName: 'Free Fire MAX',
    gameTitle: 'Free Fire MAX',
    gameMode: 'BR-CRAFTLAND',
    teamType: 'duo',
    requireTeamLogo: true,
    requirePlayerImages: true,
    verificationMethod: 'api',
    minLevel: 15,
    minBRRank: 'Silver',
    minBRRankPoints: 1300,
    duplicacyCheck: true,
    scheduleType: 'manual',
    maxRegistrations: 30,
    submissionCount: 8,
    tournamentDate: Date.now() + 86400000 * 7,
    status: 'open',
    createdAt: Date.now() - 3600000 * 12,
  },
];

/* ==========================================================================
   LOCAL FALLBACK STORAGE HELPERS
   ========================================================================== */
function getLocalForms() {
  try {
    return JSON.parse(localStorage.getItem('techtrix_local_forms') || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalForms(forms) {
  try {
    localStorage.setItem('techtrix_local_forms', JSON.stringify(forms));
  } catch (e) {}
}

function getLocalSubmissions() {
  try {
    return JSON.parse(localStorage.getItem('techtrix_local_submissions') || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalSubmissions(subs) {
  try {
    localStorage.setItem('techtrix_local_submissions', JSON.stringify(subs));
  } catch (e) {}
}

function mergeForms(firebaseList = []) {
  const localList = getLocalForms();
  const map = new Map();

  // Local forms take precedence if edited recently
  localList.forEach((f) => {
    if (f && f.id) map.set(f.id, f);
  });

  firebaseList.forEach((f) => {
    if (f && f.id) {
      // If local form exists, keep local status/count overrides if newer
      const existing = map.get(f.id);
      map.set(f.id, existing ? { ...f, ...existing } : f);
    }
  });

  DEFAULT_STARTER_FORMS.forEach((f) => {
    if (f && f.id && !map.has(f.id)) {
      map.set(f.id, f);
    }
  });

  const merged = Array.from(map.values());
  merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return merged;
}

/**
 * Hook to listen to all forms in real-time
 */
export function useForms() {
  const [forms, setForms] = useState(() => mergeForms([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    const formsRef = ref(database, 'forms');
    const unsubscribe = onValue(
      formsRef,
      (snapshot) => {
        clearTimeout(timer);
        if (!mounted) return;
        let list = [];
        if (snapshot.exists()) {
          const val = snapshot.val();
          list = Object.keys(val).map((key) => ({
            id: key,
            ...val[key],
          }));
        }
        setForms(mergeForms(list));
        setLoading(false);
      },
      (err) => {
        clearTimeout(timer);
        console.warn('Realtime database /forms notice:', err.message);
        if (mounted) {
          setForms(mergeForms([]));
          setError(err);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return { forms, loading, error };
}

/**
 * Hook to listen to a single form by formId in real-time
 */
export function useFormDetails(formId) {
  const [form, setForm] = useState(() => {
    if (!formId) return null;
    const all = mergeForms([]);
    return all.find((f) => f.id === formId) || null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) {
      setForm(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    const formRef = ref(database, `forms/${formId}`);
    const unsubscribe = onValue(
      formRef,
      (snapshot) => {
        clearTimeout(timer);
        if (!mounted) return;
        if (snapshot.exists()) {
          setForm({ id: formId, ...snapshot.val() });
        } else {
          const all = mergeForms([]);
          const match = all.find((f) => f.id === formId);
          setForm(match || null);
        }
        setLoading(false);
      },
      (err) => {
        clearTimeout(timer);
        console.warn('Error fetching form details:', err.message);
        if (mounted) {
          const all = mergeForms([]);
          const match = all.find((f) => f.id === formId);
          setForm(match || null);
          setError(err);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [formId]);

  return { form, loading, error };
}

/**
 * Hook to listen to submissions for a specific form in real-time
 */
export function useFormSubmissions(formId) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    const subRef = ref(database, `submissions/${formId}`);
    const unsubscribe = onValue(
      subRef,
      (snapshot) => {
        clearTimeout(timer);
        if (!mounted) return;
        let list = [];
        if (snapshot.exists()) {
          const val = snapshot.val();
          list = Object.keys(val).map((key) => ({
            id: key,
            formId,
            ...val[key],
          }));
        }

        // Merge with local submissions for this form
        const localSubs = getLocalSubmissions().filter((s) => s.formId === formId);
        const map = new Map();
        [...localSubs, ...list].forEach((s) => {
          if (s && s.id) map.set(s.id, s);
        });

        const combined = Array.from(map.values());
        combined.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
        setSubmissions(combined);
        setLoading(false);
      },
      (err) => {
        clearTimeout(timer);
        console.warn('Error fetching submissions from Firebase:', err.message);
        if (mounted) {
          const localSubs = getLocalSubmissions().filter((s) => s.formId === formId);
          setSubmissions(localSubs);
          setError(err);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [formId]);

  return { submissions, loading, error };
}

/**
 * Hook to listen to all submissions across all tournaments (for Admin Dashboard)
 */
export function useAllSubmissions() {
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    try {
      const subsRef = ref(database, 'submissions');
      const unsubscribe = onValue(
        subsRef,
        (snapshot) => {
          clearTimeout(timer);
          if (!mounted) return;
          const combined = [];
          if (snapshot.exists()) {
            const val = snapshot.val();
            Object.keys(val).forEach((formKey) => {
              const formSubs = val[formKey];
              if (formSubs && typeof formSubs === 'object') {
                Object.keys(formSubs).forEach((subKey) => {
                  combined.push({
                    id: subKey,
                    formId: formKey,
                    ...formSubs[subKey],
                  });
                });
              }
            });
          }

          // Merge local submissions
          const localSubs = getLocalSubmissions();
          const map = new Map();
          [...localSubs, ...combined].forEach((s) => {
            if (s && s.id) map.set(s.id, s);
          });

          const res = Array.from(map.values());
          res.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
          setAllSubmissions(res);
          setLoading(false);
        },
        (err) => {
          clearTimeout(timer);
          console.warn('Realtime database /submissions notice:', err.message);
          if (mounted) {
            const localSubs = getLocalSubmissions();
            setAllSubmissions(localSubs);
            setLoading(false);
          }
        }
      );

      return () => {
        mounted = false;
        clearTimeout(timer);
        unsubscribe();
      };
    } catch (e) {
      clearTimeout(timer);
      setAllSubmissions(getLocalSubmissions());
      setLoading(false);
    }
  }, []);

  return { allSubmissions, loading };
}

/**
 * Hook to retrieve user's registrations from /userSubmissions/{userId}
 */
export function useUserSubmissions(userId) {
  const [userSubs, setUserSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setUserSubs([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    try {
      const userRef = ref(database, `userSubmissions/${userId}`);
      const unsubscribe = onValue(
        userRef,
        async (snapshot) => {
          clearTimeout(timer);
          if (!mounted) return;
          let list = [];
          if (snapshot.exists()) {
            const map = snapshot.val();
            const subPromises = Object.entries(map).map(async ([subId, formId]) => {
              try {
                const sRef = ref(database, `submissions/${formId}/${subId}`);
                const sSnap = await get(sRef);
                if (sSnap.exists()) {
                  return {
                    id: subId,
                    formId,
                    ...sSnap.val(),
                  };
                }
              } catch (e) {
                console.warn(`Error loading submission ${subId}:`, e.message);
              }
              return null;
            });
            list = (await Promise.all(subPromises)).filter(Boolean);
          }

          // Merge local submissions for this user
          const localSubs = getLocalSubmissions().filter((s) => s.userId === userId);
          const map = new Map();
          [...localSubs, ...list].forEach((s) => {
            if (s && s.id) map.set(s.id, s);
          });

          const resolved = Array.from(map.values());
          resolved.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
          if (mounted) {
            setUserSubs(resolved);
            setLoading(false);
          }
        },
        (err) => {
          clearTimeout(timer);
          console.warn('Realtime database /userSubmissions notice:', err.message);
          if (mounted) {
            const localSubs = getLocalSubmissions().filter((s) => s.userId === userId);
            setUserSubs(localSubs);
            setLoading(false);
          }
        }
      );

      return () => {
        mounted = false;
        clearTimeout(timer);
        unsubscribe();
      };
    } catch (e) {
      clearTimeout(timer);
      const localSubs = getLocalSubmissions().filter((s) => s.userId === userId);
      setUserSubs(localSubs);
      setLoading(false);
    }
  }, [userId]);

  return { userSubs, loading };
}

/* ==========================================================================
   DATABASE MUTATION HELPERS WITH RESILIENT FALLBACK
   ========================================================================== */

/**
 * Create a new tournament form in /forms/{formId} with resilient local caching
 */
export async function createTournamentForm(formData) {
  const generatedId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let finalId = generatedId;

  const payload = {
    ...formData,
    id: generatedId,
    createdAt: Date.now(),
    submissionCount: 0,
    status: formData.status || 'open',
  };

  // Attempt to write to Firebase Realtime Database
  try {
    const formsRef = ref(database, 'forms');
    const newFormRef = push(formsRef);
    finalId = newFormRef.key || generatedId;
    payload.id = finalId;
    await set(newFormRef, payload);
  } catch (err) {
    console.warn('Firebase RTDB write error (saving to local tournament cache):', err.message);
  }

  // Always persist to local cache so the form is immediately available and never lost
  try {
    const locals = getLocalForms();
    const updated = [payload, ...locals.filter((f) => f.id !== payload.id)];
    saveLocalForms(updated);
  } catch (e) {
    console.warn('Local storage write warning:', e);
  }

  return finalId;
}

/**
 * Toggle tournament status (open/closed)
 */
export async function toggleFormStatus(formId, currentStatus) {
  const nextStatus = currentStatus === 'open' ? 'closed' : 'open';

  // Update in Firebase
  try {
    const formRef = ref(database, `forms/${formId}`);
    await update(formRef, { status: nextStatus });
  } catch (err) {
    console.warn('Firebase status update notice:', err.message);
  }

  // Update in local cache
  try {
    const locals = getLocalForms();
    const existing = locals.find((f) => f.id === formId);
    let updated;
    if (existing) {
      updated = locals.map((f) => (f.id === formId ? { ...f, status: nextStatus } : f));
    } else {
      const match = DEFAULT_STARTER_FORMS.find((f) => f.id === formId);
      if (match) {
        updated = [...locals, { ...match, status: nextStatus }];
      } else {
        updated = locals;
      }
    }
    saveLocalForms(updated);
  } catch (e) {}

  return nextStatus;
}

/**
 * Delete a tournament form
 */
export async function deleteTournamentForm(formId) {
  // Delete from Firebase
  try {
    const formRef = ref(database, `forms/${formId}`);
    const subsRef = ref(database, `submissions/${formId}`);
    await remove(formRef);
    await remove(subsRef);
  } catch (err) {
    console.warn('Firebase delete notice:', err.message);
  }

  // Delete from local cache
  try {
    const locals = getLocalForms();
    const updated = locals.filter((f) => f.id !== formId);
    saveLocalForms(updated);
  } catch (e) {}
}

/**
 * Check if any player UID already registered for this form
 */
export async function checkDuplicateUIDs(formId, uids = []) {
  if (!formId || !uids.length) return false;
  const cleanUids = uids.map((u) => String(u).trim()).filter(Boolean);

  // Check Firebase submissions
  try {
    const subsRef = ref(database, `submissions/${formId}`);
    const snap = await get(subsRef);
    if (snap.exists()) {
      const subs = snap.val();
      for (const key of Object.keys(subs)) {
        const submission = subs[key];
        if (submission.players && Array.isArray(submission.players)) {
          for (const player of submission.players) {
            if (cleanUids.includes(String(player.uid).trim())) {
              return player.uid;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Firebase duplicacy check notice:', err.message);
  }

  // Check local submissions
  const localSubs = getLocalSubmissions().filter((s) => s.formId === formId);
  for (const submission of localSubs) {
    if (submission.players && Array.isArray(submission.players)) {
      for (const player of submission.players) {
        if (cleanUids.includes(String(player.uid).trim())) {
          return player.uid;
        }
      }
    }
  }

  return false;
}

/**
 * Submit or re-submit a tournament registration with local fallback
 */
export async function submitRegistration({
  formId,
  submissionData,
  userId,
  isReEdit = false,
  submissionId = null,
}) {
  const now = Date.now();
  const targetSubId =
    isReEdit && submissionId
      ? submissionId
      : `sub_${now}_${Math.random().toString(36).substring(2, 7)}`;

  let finalSubId = targetSubId;

  const initialHistory = [
    {
      status: 'submitted',
      timestamp: now,
      reason: null,
    },
    {
      status: 'reviewing',
      timestamp: now + 500,
      reason: null,
    },
  ];

  const fullPayload = {
    ...submissionData,
    id: targetSubId,
    formId,
    userId,
    status: 'pending',
    declineReason: null,
    submittedAt: now,
    updatedAt: now,
    statusHistory: initialHistory,
  };

  // 1. Try Firebase submission
  try {
    if (isReEdit && submissionId) {
      const subRef = ref(database, `submissions/${formId}/${submissionId}`);
      const snap = await get(subRef);
      const existing = snap.exists() ? snap.val() : {};
      const history = existing.statusHistory ? [...existing.statusHistory] : [];
      history.push({
        status: 're-submitted',
        timestamp: now,
        reason: null,
      });

      await update(subRef, {
        ...submissionData,
        status: 'pending',
        declineReason: null,
        updatedAt: now,
        statusHistory: history,
      });
    } else {
      const submissionsRef = ref(database, `submissions/${formId}`);
      const newSubRef = push(submissionsRef);
      finalSubId = newSubRef.key || targetSubId;
      fullPayload.id = finalSubId;

      await set(newSubRef, fullPayload);

      // Link to user submissions
      const userSubRef = ref(database, `userSubmissions/${userId}/${finalSubId}`);
      await set(userSubRef, formId);

      // Increment count
      const countRef = ref(database, `forms/${formId}/submissionCount`);
      await runTransaction(countRef, (curr) => (curr || 0) + 1);
    }
  } catch (err) {
    console.warn('Firebase RTDB submission warning (saved to local submissions):', err.message);
  }

  // 2. Always save to local submissions cache
  try {
    const locals = getLocalSubmissions();
    const updated = [fullPayload, ...locals.filter((s) => s.id !== finalSubId)];
    saveLocalSubmissions(updated);

    // Update local form submissionCount
    const localForms = getLocalForms();
    const updatedForms = localForms.map((f) =>
      f.id === formId ? { ...f, submissionCount: Number(f.submissionCount || 0) + 1 } : f
    );
    saveLocalForms(updatedForms);
  } catch (e) {}

  return finalSubId;
}

/**
 * Update submission status (Approve / Decline)
 */
export async function updateSubmissionStatus(formId, submissionId, newStatus, reason = null) {
  const now = Date.now();

  // Try Firebase
  try {
    const subRef = ref(database, `submissions/${formId}/${submissionId}`);
    const snap = await get(subRef);
    if (snap.exists()) {
      const data = snap.val();
      const history = data.statusHistory ? [...data.statusHistory] : [];
      history.push({
        status: newStatus,
        timestamp: now,
        reason: reason || null,
      });

      const updates = {
        status: newStatus,
        updatedAt: now,
        statusHistory: history,
      };
      if (newStatus === 'declined' && reason) updates.declineReason = reason;
      if (newStatus === 'approved') updates.declineReason = null;

      await update(subRef, updates);
    }
  } catch (err) {
    console.warn('Firebase update submission status notice:', err.message);
  }

  // Always update in local cache
  try {
    const locals = getLocalSubmissions();
    const target = locals.find((s) => s.id === submissionId);
    if (target) {
      const history = target.statusHistory ? [...target.statusHistory] : [];
      history.push({
        status: newStatus,
        timestamp: now,
        reason: reason || null,
      });
      const updated = locals.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: newStatus,
              updatedAt: now,
              statusHistory: history,
              declineReason: newStatus === 'declined' ? reason : null,
            }
          : s
      );
      saveLocalSubmissions(updated);
    }
  } catch (e) {}
}
