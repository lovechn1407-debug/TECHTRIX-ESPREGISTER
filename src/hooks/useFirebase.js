import { useState, useEffect } from 'react';
import {
  ref,
  push,
  set,
  update,
  remove,
  get,
  onValue,
  serverTimestamp,
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

/**
 * Hook to listen to all forms in real-time
 */
export function useForms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const formsRef = ref(database, 'forms');
    const unsubscribe = onValue(
      formsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list = Object.keys(val).map((key) => ({
            id: key,
            ...val[key],
          }));
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setForms(list);
        } else {
          setForms(DEFAULT_STARTER_FORMS);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime database returned notice, loading starter tournaments:', err.message);
        setForms(DEFAULT_STARTER_FORMS);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { forms, loading, error };
}

/**
 * Hook to listen to a single form by formId in real-time
 */
export function useFormDetails(formId) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) {
      setForm(null);
      setLoading(false);
      return;
    }

    const formRef = ref(database, `forms/${formId}`);
    const unsubscribe = onValue(
      formRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setForm({ id: formId, ...snapshot.val() });
        } else {
          const starterMatch = DEFAULT_STARTER_FORMS.find((f) => f.id === formId);
          setForm(starterMatch || null);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Error fetching form details, checking starter forms:', err.message);
        const starterMatch = DEFAULT_STARTER_FORMS.find((f) => f.id === formId);
        setForm(starterMatch || null);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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

    const subRef = ref(database, `submissions/${formId}`);
    const unsubscribe = onValue(
      subRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list = Object.keys(val).map((key) => ({
            id: key,
            formId,
            ...val[key],
          }));
          list.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
          setSubmissions(list);
        } else {
          setSubmissions([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching submissions:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
    // Safety timeout: never hang loading for more than 2 seconds
    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2000);

    try {
      const subsRef = ref(database, 'submissions');
      const unsubscribe = onValue(
        subsRef,
        (snapshot) => {
          clearTimeout(timer);
          if (!mounted) return;
          if (snapshot.exists()) {
            const val = snapshot.val();
            const combined = [];
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
            combined.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
            setAllSubmissions(combined);
          } else {
            setAllSubmissions([]);
          }
          setLoading(false);
        },
        (err) => {
          clearTimeout(timer);
          console.warn('Realtime database /submissions notice:', err.message);
          if (mounted) {
            setAllSubmissions([]);
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
      console.warn('Error connecting to submissions:', e);
      clearTimeout(timer);
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
    }, 2500);

    try {
      const userRef = ref(database, `userSubmissions/${userId}`);
      const unsubscribe = onValue(
        userRef,
        async (snapshot) => {
          clearTimeout(timer);
          if (!mounted) return;
          if (!snapshot.exists()) {
            setUserSubs([]);
            setLoading(false);
            return;
          }

          const map = snapshot.val(); // { [submissionId]: formId }
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

          const resolved = (await Promise.all(subPromises)).filter(Boolean);
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
            setUserSubs([]);
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
      console.warn('Error in useUserSubmissions:', e);
      clearTimeout(timer);
      setLoading(false);
    }
  }, [userId]);

  return { userSubs, loading };
}

/* ==========================================================================
   DATABASE MUTATION HELPERS
   ========================================================================== */

/**
 * Create a new tournament form in /forms/{formId}
 */
export async function createTournamentForm(formData) {
  const formsRef = ref(database, 'forms');
  const newFormRef = push(formsRef);
  const payload = {
    ...formData,
    createdAt: Date.now(),
    submissionCount: 0,
    status: formData.status || 'open',
  };
  await set(newFormRef, payload);
  return newFormRef.key;
}

/**
 * Toggle tournament status (open/closed)
 */
export async function toggleFormStatus(formId, currentStatus) {
  const nextStatus = currentStatus === 'open' ? 'closed' : 'open';
  const formRef = ref(database, `forms/${formId}`);
  await update(formRef, { status: nextStatus });
  return nextStatus;
}

/**
 * Delete a tournament form
 */
export async function deleteTournamentForm(formId) {
  const formRef = ref(database, `forms/${formId}`);
  const subsRef = ref(database, `submissions/${formId}`);
  await remove(formRef);
  await remove(subsRef);
}

/**
 * Check if any player UID already registered for this form
 */
export async function checkDuplicateUIDs(formId, uids = []) {
  if (!formId || !uids.length) return false;
  const subsRef = ref(database, `submissions/${formId}`);
  const snap = await get(subsRef);
  if (!snap.exists()) return false;

  const subs = snap.val();
  const cleanUids = uids.map((u) => String(u).trim()).filter(Boolean);

  for (const key of Object.keys(subs)) {
    const submission = subs[key];
    if (submission.players && Array.isArray(submission.players)) {
      for (const player of submission.players) {
        if (cleanUids.includes(String(player.uid).trim())) {
          return player.uid; // returns duplicate UID found
        }
      }
    }
  }
  return false;
}

/**
 * Submit or re-submit a tournament registration
 */
export async function submitRegistration({
  formId,
  submissionData,
  userId,
  isReEdit = false,
  submissionId = null,
}) {
  const now = Date.now();

  if (isReEdit && submissionId) {
    // Re-submission flow
    const subRef = ref(database, `submissions/${formId}/${submissionId}`);
    const snap = await get(subRef);
    const existing = snap.exists() ? snap.val() : {};

    const history = existing.statusHistory ? [...existing.statusHistory] : [];
    history.push({
      status: 're-submitted',
      timestamp: now,
      reason: null,
    });

    const updatePayload = {
      ...submissionData,
      status: 'pending',
      declineReason: null,
      updatedAt: now,
      statusHistory: history,
    };

    await update(subRef, updatePayload);
    return submissionId;
  }

  // Brand new submission
  const submissionsRef = ref(database, `submissions/${formId}`);
  const newSubRef = push(submissionsRef);
  const targetSubId = newSubRef.key;

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

  await set(newSubRef, fullPayload);

  // Link to user submissions index
  const userSubRef = ref(database, `userSubmissions/${userId}/${targetSubId}`);
  await set(userSubRef, formId);

  // Increment submissionCount on form safely using runTransaction
  const countRef = ref(database, `forms/${formId}/submissionCount`);
  await runTransaction(countRef, (currentCount) => {
    return (currentCount || 0) + 1;
  });

  return targetSubId;
}

/**
 * Update submission status (Approve / Decline)
 */
export async function updateSubmissionStatus(formId, submissionId, newStatus, reason = null) {
  const subRef = ref(database, `submissions/${formId}/${submissionId}`);
  const snap = await get(subRef);
  if (!snap.exists()) throw new Error('Submission not found');

  const data = snap.val();
  const history = data.statusHistory ? [...data.statusHistory] : [];

  history.push({
    status: newStatus,
    timestamp: Date.now(),
    reason: reason || null,
  });

  const updates = {
    status: newStatus,
    updatedAt: Date.now(),
    statusHistory: history,
  };

  if (newStatus === 'declined' && reason) {
    updates.declineReason = reason;
  } else if (newStatus === 'approved') {
    updates.declineReason = null;
  }

  await update(subRef, updates);
}
