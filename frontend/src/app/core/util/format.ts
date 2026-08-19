export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const day = formatDate(iso);
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${day}, ${time}`;
}

/** "2 hours ago" (falls back to an absolute date after ~30 days). */
export function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return plural(minutes, 'minute');
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return plural(hours, 'hour');
  }
  const days = Math.round(hours / 24);
  if (days < 30) {
    return plural(days, 'day');
  }
  return formatDate(iso);
}

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
}
