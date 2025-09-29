export const hhmmToMinutes = (value) => {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
    throw new Error('Time must be HH:mm');
  }
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToHHmm = (minutes) => {
  const total = Number(minutes);
  const clamped = Math.max(0, Math.min(total, 23 * 60 + 59));
  const hours = Math.floor(clamped / 60)
    .toString()
    .padStart(2, '0');
  const mins = Math.round(clamped % 60)
    .toString()
    .padStart(2, '0');
  return `${hours}:${mins}`;
};

export const detectOverlaps = (steps) => {
  if (!Array.isArray(steps)) {
    return false;
  }
  const ordered = [...steps]
    .filter((step) => step.startTime && step.durationMin)
    .sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime));
  for (let i = 1; i < ordered.length; i += 1) {
    const prev = ordered[i - 1];
    const current = ordered[i];
    const prevEnd = hhmmToMinutes(prev.startTime) + Number(prev.durationMin || 0);
    const currentStart = hhmmToMinutes(current.startTime);
    if (prevEnd > currentStart) {
      return true;
    }
  }
  return false;
};

export const sortByStartTime = (steps) =>
  [...steps].sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime));
