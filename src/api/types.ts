export type ApiStatus = {
  message: string;
};

export type ApiError = {
  error: string;
};

export type ApiResponse =
  | ApiStatus
  | ApiError;

export type AuthOk = {
  token: string;
};

export type Bot = {
  id: number;
  username: string;
  active: boolean;
};

export type ChatRaw = {
  id: number;
  firstName: string;
  username: string;
  lastMessageText: string;
  lastMessageDate: string;
  lastMessageFrom: boolean;
  lastMessageNew: boolean;
  avatarUrl?: string;
};

export type Chat = Omit<ChatRaw, 'lastMessageDate'> & {
  lastMessageDate: Date;
};

export type ChatsRaw = {
  chats: ChatRaw[];
  count: number;
};

export type Chats = {
  count: number;
  chats: Chat[];
};

export enum MediaType {
  Image = 1,
  Video = 2,
};

export type Media = {
  type: MediaType;
  id: string;
};

export type MessageRaw = {
  id: number;
  timestamp: string;
  text: string;
  from: boolean;
  new: boolean;
  media?: Media;
};

export type Message = Omit<MessageRaw, 'timestamp'> & {
  timestamp: Date;
};

export type MessagesRaw = {
  messages: MessageRaw[];
  count: number;
};

export type Messages = {
  count: number;
  messages: Message[];
};

export type WsMessageEventRaw = {
  event: 'message';
  chatId: number;
  botId: number;
  message: MessageRaw;
  chat: ChatRaw;
};

export type WsMessageEvent = Omit<WsMessageEventRaw, 'message' | 'chat'> & {
  message: Message;
  chat: Chat;
};

export type WsAuthorizedEvent = {
  event: 'authorized';
};

export type WebsocketError = {
  event: 'error';
  message: string;
};

export type WebsocketEventIn =
  | WsMessageEventRaw
  | WsAuthorizedEvent
  | WebsocketError;

export type WebsocketEventInType = WebsocketEventIn['event'];

export type AuthorizeEvent = {
  event: 'authorize';
  token: string;
};

export type WebsocketEventOut =
  | AuthorizeEvent;

export type MailingRunningRaw = {
	status: 'running';
	processed: number;
	total: number;
	started: string;
};

export type MailingRunning = Omit<MailingRunningRaw, 'started'> & {
  started: Date;
};

export type MailingStoppedRaw = {
	status: 'stopped';
	processed: number;
	total: number;
	started: string;
	stopped: string;
};

export type MailingStopped = Omit<MailingStoppedRaw, 'started' | 'stopped'> & {
  started: Date;
  stopped: Date;
};

export type MailingIdle = {
	status: 'idle';
};

export type MailingStatusRaw =
	| MailingRunningRaw
	| MailingStoppedRaw
	| MailingIdle;

export type MailingStatus =
	| MailingRunning
	| MailingStopped
	| MailingIdle;
