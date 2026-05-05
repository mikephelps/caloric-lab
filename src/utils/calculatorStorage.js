const STORAGE_KEY = 'caloriclab_calculator';
const TTL_MS = 24 * 60 * 60 * 1000;

export function saveCalculatorData(data) {
  try {
    const existing = loadCalculatorData() || { biometrics: {}, results: {} };
    const merged = {
      savedAt: Date.now(),
      biometrics: { ...existing.biometrics, ...(data.biometrics || {}) },
      results:    { ...existing.results,    ...(data.results    || {}) },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}
}

export function loadCalculatorData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.savedAt || Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearCalculatorData() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
