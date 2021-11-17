import storage from '../storage';
import notify from '../notifications';
import { WsMessageEvent, WebsocketEventOut, WebsocketEventIn } from './types';
import { messageFromRaw, chatFromRaw } from './service';

export const wsURL = 'wss://myteamgen.tk/api/ws';

type AuthResolveCallback = (result: boolean) => void;

type MessageHandler = (event: WsMessageEvent) => void | Promise<void>;

class WebsocketService {
  private readonly ws = new WebSocket(wsURL);
  private authResolver: AuthResolveCallback | undefined = undefined;
  private messageHandler: MessageHandler | undefined = undefined;
  private connected: boolean = false;
  private connectResolvers: Set<() => void> = new Set();

  constructor() {
    this.ws.addEventListener('open', () => {
      this.connected = true;
      this.connectResolvers.forEach(resolve => {
        this.connectResolvers.delete(resolve);
        setImmediate(resolve);
      });
    });

    this.ws.addEventListener('message', (ev: MessageEvent<any>) => {
      try {
        const event: WebsocketEventIn = JSON.parse(ev.data);
        switch (event.event) {
          case 'authorized':
            if (this.authResolver) {
              this.authResolver(true);
              this.authResolver = undefined;
            }
            break;
          case 'error':
            if (event.message === 'unauthorized' && this.authResolver) {
              this.authResolver(false);
              this.authResolver = undefined;
            }
            break;
          case 'message':
            const ev = {
              ...event,
              message: messageFromRaw(event.message),
              chat: chatFromRaw(event.chat)
            };
            if (this.messageHandler) {
              this.messageHandler(ev);
            }
            notify.showMessageNotification(ev.message, ev.chat);
            break;
        }
      } catch (e) {
      }
    });
  }

  async sendEvent(event: WebsocketEventOut): Promise<void> {
    if (!this.connected) {
      await new Promise<void>(resolve => this.connectResolvers.add(resolve));
    }
    this.ws.send(JSON.stringify(event));
  }

  async authorize(): Promise<boolean> {
    const { token } = storage.get();

    if (!token) {
      return false;
    }

    this.sendEvent({
      event: 'authorize',
      token,
    });

    return new Promise<boolean>(resolve => {
      this.authResolver = resolve;
    });
  }

  setMessageHandler(handler: MessageHandler): void {
    this.messageHandler = handler;
  }

  removeMessageHandler(): void {
    this.messageHandler = undefined;
  }
}

const service = new WebsocketService();
service.authorize();

export default service;
