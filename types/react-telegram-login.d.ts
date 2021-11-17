declare module 'react-telegram-login' {
  import React from 'react';

  export type ITelegramData = {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    photo_url: string;
    auth_date: number;
    hash: string;
  };

  export type ILoginWidgetProps = {
    botName: string;
    dataOnauth?: (data: ITelegramData) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: string;
    usePic?: boolean;
    lang?: string;
    widgetVersion?: number;
  };

  export default class TelegramLoginWidget extends React.Component<ILoginWidgetProps> {};
}

