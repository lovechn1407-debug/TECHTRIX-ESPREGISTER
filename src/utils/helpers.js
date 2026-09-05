// Helper functions for dates, formatting, and validation

/**
 * Format a timestamp or date string into readable date (e.g. "Sep 6, 2026")
 */
export function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format timestamp into date & time (e.g. "Sep 6, 2026, 3:45 PM")
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return 'N/A';
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns human-readable relative time (e.g. "2 min ago", "just now")
 */
export function getRelativeTime(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const past = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1 min ago';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
  if (diffSec < 7200) return '1 hour ago';
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 172800) return 'yesterday';
  return formatDate(timestamp);
}

/**
 * Calculate account age from Free Fire API createAt (seconds or milliseconds timestamp)
 */
export function calculateAccountAge(createAt) {
  if (!createAt) return 'Unknown';
  let epoch = Number(createAt);
  if (epoch < 10000000000) {
    epoch *= 1000; // convert seconds to ms
  }
  const createdDate = new Date(epoch);
  if (isNaN(createdDate.getTime())) return 'Unknown';

  const now = new Date();
  let years = now.getFullYear() - createdDate.getFullYear();
  let months = now.getMonth() - createdDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0) {
    return `${years} yr${years > 1 ? 's' : ''} ${months > 0 ? `${months} mo` : ''}`.trim();
  }
  if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  }
  const days = Math.floor((now.getTime() - epoch) / (1000 * 60 * 60 * 24));
  return `${Math.max(1, days)} days`;
}

/**
 * Validate 10-digit Indian WhatsApp phone number
 */
export function validateWhatsApp(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Allows 10 digits directly or 12 digits with 91 prefix
  if (cleaned.length === 10) return true;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return true;
  return false;
}

/**
 * Format 10 digit WhatsApp into +91 XXXXX XXXXX
 */
export function formatWhatsApp(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const digits = cleaned.length === 12 && cleaned.startsWith('91') ? cleaned.slice(2) : cleaned;
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Validate Game UID (typically 6-12 digits)
 */
export function validateUID(uid) {
  if (!uid) return false;
  const trimmed = String(uid).trim();
  return /^\d{6,14}$/.test(trimmed);
}

/**
 * Checks if a tournament form registration is currently closed
 */
export function isFormClosed(form) {
  if (!form) return true;
  if (form.status === 'closed') return true;
  if (form.scheduleType === 'custom' && form.closingTime) {
    const closingMs = typeof form.closingTime === 'number' ? form.closingTime : new Date(form.closingTime).getTime();
    if (Date.now() > closingMs) return true;
  }
  return false;
}

/**
 * Checks if slots are full
 */
export function isSlotsFull(form) {
  if (!form) return false;
  if (form.maxRegistrations && form.maxRegistrations !== 'unlimited') {
    const max = Number(form.maxRegistrations);
    const current = Number(form.submissionCount || 0);
    return current >= max;
  }
  return false;
}
