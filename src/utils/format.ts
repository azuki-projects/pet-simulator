export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num < 1000) return Math.floor(num).toLocaleString();

  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  const i = Math.floor(Math.log10(Math.abs(num)) / 3);

  if (i >= suffixes.length) {
    return num.toExponential(2);
  }

  const scaled = num / Math.pow(10, i * 3);
  return `${scaled.toFixed(scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2)}${suffixes[i]}`;
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return 'Ready!';
  const s = Math.floor(seconds);

  if (s < 60) {
    return `${s}s`;
  }

  const m = Math.floor(s / 60);
  const remainingSeconds = s % 60;

  if (m < 60) {
    return `${m}m ${remainingSeconds.toString().padStart(2, '0')}s`;
  }

  const h = Math.floor(m / 60);
  const remainingMinutes = m % 60;
  return `${h}h ${remainingMinutes.toString().padStart(2, '0')}m`;
}
