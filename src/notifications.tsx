import { Message, Chat } from './api/types';

class NotificationService {
  private checked = false;
  private granted = false;
  private resolvers: Set<() => void> = new Set();

  constructor() {
    if (Notification.permission === 'default') {
      const listener = () => {
        this.checkPrivileges();
        document.removeEventListener('click', listener);
      };
      document.addEventListener('click', listener);
    } else {
      this.checked = true;
      this.granted = Notification.permission === 'granted';
    }
  }

  async checkPrivileges(): Promise<void> {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      this.granted = true;
    }
    this.checked = true;
    this.resolvers.forEach(r => {
      this.resolvers.delete(r);
      setImmediate(() => r());
    });
  }

  async showMessageNotification(msg: Message, chat: Chat): Promise<void> {
    if (!this.checked) {
      await new Promise<void>(r => this.resolvers.add(r));
    }

    if (!this.granted) {
      return;
    }

    new Notification(
      chat.firstName,
      {
        body: msg.text,
        icon: chat.avatarUrl
      }
    );
  }
}

export default new NotificationService();
