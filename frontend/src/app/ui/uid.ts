let counter = 0;

export function uid(prefix = 'ui'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
