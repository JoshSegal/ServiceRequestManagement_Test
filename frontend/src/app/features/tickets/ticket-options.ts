import { SelectOption } from '../../ui/select/select';

export const STATUS_OPTIONS: SelectOption[] = [
  { value: 'Open', label: 'Open', dotColor: 'var(--status-open-fg)' },
  { value: 'InProgress', label: 'In Progress', dotColor: 'var(--status-progress-fg)' },
  { value: 'InReview', label: 'In Review', dotColor: 'var(--status-review-fg)' },
  { value: 'Resolved', label: 'Resolved', dotColor: 'var(--status-resolved-fg)' },
  { value: 'Closed', label: 'Closed', dotColor: 'var(--status-closed-fg)' },
];

export const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'Low', label: 'Low', dotColor: 'var(--priority-low)' },
  { value: 'Medium', label: 'Medium', dotColor: 'var(--priority-medium)' },
  { value: 'High', label: 'High', dotColor: 'var(--priority-high)' },
  { value: 'Urgent', label: 'Urgent', dotColor: 'var(--priority-urgent)' },
];

export const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: 'All statuses' },
  ...STATUS_OPTIONS,
];

export const PRIORITY_FILTER_OPTIONS: SelectOption[] = [
  { value: '', label: 'All priorities' },
  ...PRIORITY_OPTIONS,
];
