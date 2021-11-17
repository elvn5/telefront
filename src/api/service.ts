import { ITelegramData } from 'react-telegram-login';
import storage from '../storage';
import {
  ApiResponse,
  AuthOk,
  Bot,
  ChatRaw,
  Chat,
  ChatsRaw,
  Chats,
  MessageRaw,
  MessagesRaw,
  Messages,
  MailingStatus,
  Message,
  MailingStatusRaw
} from './types';

export const baseURL = process.env.NODE_ENV === 'production'
  ? ''
  : 'https://myteamgen.tk';

export const messageFromRaw = (x: MessageRaw): Message => {
  return { ...x, timestamp: new Date(x.timestamp) };
};

export const chatFromRaw = ({ lastMessageDate, ...rest }: ChatRaw): Chat => ({
  ...rest,
  lastMessageDate: new Date(lastMessageDate),
});

export default class APIService {
  private static unauthorizedHandler: () => any;

  static setUnauthorizedHandler(handler: () => any): void {
    this.unauthorizedHandler = handler;
  }

  private static async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    const { token } = storage.get();

    if (!token) {
      return this.unauthorizedHandler();
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    const result = await fetch(
      baseURL + url,
      init
        ? {
          ...init,
          headers: init.headers
            ? { ...init.headers, ...headers }
            : headers
        }
        : { headers },
    );
    
    if (result.status === 401) {
      return this.unauthorizedHandler();
    }

    return result.json();
  }

  static async login(data: ITelegramData): Promise<string | null> {
    const result = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    if (result.status === 200) {
      const data = (await result.json()) as AuthOk;
      return data.token;
    }
    return null;
  }

  static async logout(): Promise<void> {
    await this.fetch('/api/auth/logout');
  }

  static async getBots(): Promise<Bot[]> {
    return this.fetch('/api/bots');
  }

  static async getChats(
    botId: number, offset: number, limit: number
  ): Promise<Chats> {
    const raw = await this.fetch<ChatsRaw>(
      `/api/chats?botId=${botId}&offset=${offset}&limit=${limit}`
    );
    return {
      count: raw.count,
      chats: raw.chats.map(chatFromRaw),
    };
  }

  static async getMessages(
    chatId: number, offset: number, limit: number,
  ): Promise<Messages>  {
    const raw = await this.fetch<MessagesRaw>(
      `/api/chats/${chatId}/messages?offset=${offset}&limit=${limit}`,
    );
    return {
      count: raw.count,
      messages: raw.messages.map(messageFromRaw),
    };
  }

  static async sendMessage(
    chatId: number, text: string, file: File | null,
  ): Promise<Message> {
    const formData = new FormData();
    formData.append('text', text);
    if (file) {
      formData.append('file', file);
    }
    const message = await this.fetch<MessageRaw>(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: formData,
    });
    return messageFromRaw(message);
  }

  static getFileUrl(fileId: string): string {
    return `${baseURL}/api/file/${fileId}`;
  }

  static async setRead(chatId: number): Promise<void> {
    await this.fetch(`/api/chats/${chatId}/setRead`);
  }

  static async startMailing(
    botId: number,
    text: string,
    userCount: number,
    file: File | null,
  ): Promise<boolean> {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('userCount', userCount.toFixed());
    if (file) {
      formData.append('file', file);
    }
    const message = await this.fetch<ApiResponse>(`/api/bots/${botId}/mail`, {
      method: 'POST',
      body: formData
    });

    if ('message' in message && message.message === 'ok') {
      return true;
    }

    return false;
  }

  static async getMailingStatus(botId: number): Promise<MailingStatus> {
    const raw = await this.fetch<MailingStatusRaw>(`/api/bots/${botId}/mail/status`);
    switch (raw.status) {
      case 'stopped':
        return {
          ...raw,
          started: new Date(raw.started),
          stopped: new Date(raw.stopped),
        };
      case 'running':
        return {
          ...raw,
          started: new Date(raw.started),
        };
      case 'idle':
        return raw;
    }
  }

  static async stopMailing(botId: number): Promise<boolean> {
    const result = await this.fetch<ApiResponse>(`/api/bots/${botId}/mail/stop`, {
      method: 'POST',
    });

    if ('message' in result && result.message === 'ok') {
      return true;
    }

    return false;
  }
}
