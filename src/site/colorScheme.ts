export type ColorScheme = 'light' | 'dark';

const STORAGE_KEY = 'pua-color-scheme';

export function currentColorScheme(): ColorScheme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function initColorScheme(): ColorScheme {
  const scheme = savedColorScheme() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = scheme;
  return scheme;
}

export function toggleColorScheme(): ColorScheme {
  const scheme: ColorScheme = currentColorScheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = scheme;
  saveColorScheme(scheme);
  return scheme;
}

function savedColorScheme(): ColorScheme | undefined {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : undefined;
  } catch {
    return undefined;
  }
}

function saveColorScheme(scheme: ColorScheme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, scheme);
  } catch {}
}
