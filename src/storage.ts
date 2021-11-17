const itemKey = 'global';

type LocalStorageData = {
  token?: string;
  currentBot?: number;
};

const dataDefault = (): LocalStorageData => ({});

function load(): LocalStorageData {
  if (process.env.NODE_ENV === 'development') {
    return {
      token: process.env.REACT_APP_DEV_TOKEN
    };
  }

  const data = window.localStorage.getItem(itemKey);

  if (!data) {
    return dataDefault();
  }

  try {
    const obj = JSON.parse(data);
    if (typeof obj !== 'object') {
      return dataDefault();
    }
    return obj;
  } catch {
    return dataDefault();
  }
};

const data = load();

export default class StorageService {
  static get(): LocalStorageData {
    return data;
  }

  static update(obj: Partial<LocalStorageData>): void {
    Object.assign(data, obj);
    window.localStorage.setItem(itemKey, JSON.stringify(data));
  }
}
