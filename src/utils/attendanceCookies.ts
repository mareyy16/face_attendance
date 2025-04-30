import Cookies from 'js-cookie';

const COOKIE_KEY = 'recorded_labels';

export const getRecordedLabels = (): Set<string> => {
  const cookie = Cookies.get(COOKIE_KEY);
  if (!cookie) return new Set();
  try {
    const parsed = JSON.parse(cookie);
    return new Set(parsed);
  } catch {
    return new Set();
  }
};

export const addLabelToCookie = (label: string): void => {
  const currentLabels = getRecordedLabels();
  currentLabels.add(label);
  Cookies.set(COOKIE_KEY, JSON.stringify([...currentLabels]), { expires: 1 / 24 }); // 1 hour
};

export const clearLabelsCookie = (): void => {
  Cookies.remove(COOKIE_KEY);
};
