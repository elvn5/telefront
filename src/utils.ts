import { format } from 'date-fns';
import { baseURL } from './api/service';

export const formatTime = (date: Date) => {
  if (Date.now() - date.getTime() < 86400000) {
    return format(date, 'HH:mm:ss');
  }
  return format(date, 'd MMM yyyy HH:mm:ss');
}

export const ellipsizeText = (text: string, len: number) => {
  if (text.length > len) {
    return text.substr(0, len - 4) + ' ...';
  }
  return text;
};

export function getAvatarUrl(url?: string): string | undefined {
  return url ? baseURL + url : undefined;
}
