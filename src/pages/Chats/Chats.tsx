import { useEffect, useState, useRef } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import BotSelect from '../../common/BotSelect';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ChatList from './components/ChatList';
import MessageList from './components/MessageList';
import Sender from './components/Sender';
import api from '../../api/service';
import wsService from '../../api/websocket';
import { Chat, Message } from '../../api/types';
import storage from '../../storage';
import { getAvatarUrl } from '../../utils';
import { BrowserView, MobileView, isMobile } from 'react-device-detect';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    messages: {
      flexGrow: 1,
      overflowY: 'scroll',
      backgroundColor: '#f4f5f9',
    },
    botList: {
      position: 'sticky',
      top: '0px',
      backgroundColor: theme.palette.background.default,
      zIndex: 999,
      paddingTop: '8px',
      paddingBottom: '8px',
    },
    chatList: {
      height: isMobile ? '94vh' : '95vh',
      overflowY: 'scroll',
    },
    leftPane: {
      height: isMobile ? '94vh' : '95vh',
      display: 'flex',
      flexDirection: 'column',
    },
    rightPane: {
      flexGrow: 1,
      height: isMobile ? '94vh' : '95vh',
      display: 'flex',
      flexDirection: 'column',
    },
    infoMessage: {
      textAlign: 'center',
      position: 'relative',
      top: '50%',
      padding: theme.spacing(1),
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 'fit-content',
      backgroundColor: theme.palette.grey[300],
      fontSize: 'smaller'
    },
    chatInfo: {
      display: 'flex',
      flexDirection: 'row',
      paddingLeft: theme.spacing(1)
    },
    chatInfoText: {
      marginLeft: theme.spacing(2),
      marginRight: 'auto',
      fontSize: 'larger'
    }
  }),
);

const updateChatList = (
  chats: Chat[], chatId: number, message: Message
): Chat[] => {
  for (const chat of chats) {
    if (chat.id === chatId) {
      chat.lastMessageNew = message.new;
      chat.lastMessageDate = message.timestamp;
      chat.lastMessageFrom = message.from;
      chat.lastMessageText = message.text;
      break;
    }
  }

  chats.sort(
    (a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime(),
  );

  return [...chats];
}

type MessageState = {
  messages: Message[];
  currentChatId: number;
};

type ChatDraft = {
  text: string;
  file: File | null;
};

const chatDrafts: Map<number, ChatDraft> = new Map;

const getDraft = (id: number) => {
  let draft = chatDrafts.get(id);
  if (draft) {
    return draft;
  }
  draft = { text: '', file: null };
  chatDrafts.set(id, draft);

  return draft;
};

const clearDraft = (id: number) => chatDrafts.delete(id);

const Chats = () => {
  const classes = useStyles();

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentBot, setCurrentBot] = useState<number>(
    storage.get().currentBot || 0,
  );
  const [currentChatId, setChatId] = useState(0);
  const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined);
  const [messages, setMessages] = useState<MessageState>({
    messages: [],
    currentChatId,
  });
  const [noMessages, setNoMessages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [newMessageFile, setNewMessageFile] = useState<File | null>(null);

  const messageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(getDraft(currentChatId));

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const updateChats = async () => {
      if (currentBot <= 0) {
        return;
      }
      const { chats } = await api.getChats(currentBot, 0, 10);
      setChats(() => chats);
    }

    updateChats();
  }, [currentBot]);

  const setRead = (chatId: number) => {
    setChats(
      chats => chats.map(
        x => x.id === chatId ? { ...x, lastMessageNew: false } : x
      )
    );
    api.setRead(chatId);
  }

  useEffect(() => {
    setNoMessages(false);

    const updateMessages = async () => {
      if (currentChatId <= 0) {
        return;
      }
      const { messages } = await api.getMessages(currentChatId, 0, 10);

      messages.reverse();
      setMessages(() => ({ messages, currentChatId }));
      setChats(chats => updateChatList(chats, currentChatId, messages[messages.length - 1]));
      if (messages.some(x => x.new)) {
        setRead(currentChatId);
      }
      setImmediate(() => scrollToBottom());
    }

    const draft = getDraft(currentChatId);

    setNewMessageText(draft.text);
    setNewMessageFile(draft.file);

    setDraft(draft);

    updateMessages();
  }, [currentChatId]);

  const pushMessage = (message: Message, chatId: number) => {
    setChats(chats => updateChatList(chats, chatId, message));
    setMessages(state => {
      if (state.currentChatId === chatId) {
        if (message.new) {
          setRead(chatId);
        }
        setImmediate(() => scrollToBottom());
        return {
          ...state,
          messages: [...state.messages, { ...message, new: false }],
        };
      } else {
        return state;
      }
    });
  }

  useEffect(() => {
    wsService.setMessageHandler(event => {
      if (currentBot !== event.botId) {
        return;
      }
      setChats(chats => {
        if (chats.find(x => x.id === event.chat.id)) {
          return chats;
        }
        return [event.chat, ...chats];
      });
      pushMessage(event.message, event.chatId);
    });

    return () => wsService.removeMessageHandler();
  }, [currentBot]);

  const sendMessage = async (text: string, file: File | null) => {
    try {
      const message = await api.sendMessage(currentChatId, text, file);
      pushMessage(message, currentChatId);
    } catch (e) {
    }
  };

  const pushMessages = (newMessages: Message[]) => {
    setMessages(state => {
      const merged = [...state.messages, ...newMessages];
      const messageIds = new Set<number>();

      for (let i = 0; i < merged.length; i++) {
        if (messageIds.has(merged[i].id)) {
          merged.splice(i, 1);
          i -= 1;
        } else {
          messageIds.add(merged[i].id);
        }
      }

      return {
        ...state,
        messages: merged.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
        )
      };
    });
  };

  const fetchMessages = async () => {
    if (noMessages) {
      return;
    }
    setLoading(true);
    const { messages: newMessages } = await api.getMessages(
      currentChatId,
      messages.messages.length,
      10,
    );
    if (newMessages.length === 0) {
      setNoMessages(true);
    } else {
      pushMessages(newMessages);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 50;
      }
    }
    setLoading(false);
  };

  const leftPane = () =>
    <Box borderRight={isMobile ? 0 : 1}>
      <div className={classes.leftPane}>
        <BotSelect
          onBotIdChanged={botId => {
            setCurrentBot(botId);
            storage.update({ currentBot: botId });
          }}
          currentBot={currentBot}
        />
        <ChatList
          chats={chats}
          onChatSelected={chat => {
            setChatId(chat.id);
            setCurrentChat(chat);
          }}
        />
      </div>
    </Box>;

  const rightPane = () => {
    let content;

    if (currentChat) {
      content =
        <>
          <Box borderBottom={1}>
            <Toolbar className={classes.chatInfo}>
              <IconButton
                onClick={() => {
                  setChatId(0);
                  setCurrentChat(undefined);
                }}
              >
                <ArrowBackIcon/>
              </IconButton>
              <Avatar
                src={getAvatarUrl(currentChat.avatarUrl)}
                alt={currentChat.firstName}/>
              <Typography className={classes.chatInfoText}>
                {currentChat.firstName}
                {currentChat.username
                  ? (
                    <>
                      <span>&nbsp;&nbsp;(</span>
                      <Link href={`https://t.me/${currentChat.username}`}>
                        @{currentChat.username}
                      </Link>
                      <span>)</span>
                    </>
                  )
                  : <></>
                }
              </Typography>
            </Toolbar>
          </Box>
          <div
            className={classes.messages}
            ref={scrollRef}
            onScroll={() => {
              if (scrollRef.current && scrollRef.current.scrollTop === 0) {
                if (loading) {
                  return;
                }
                fetchMessages();
              }
            }}
          >
            <MessageList
              messages={messages.messages}
              loading={loading}
              chat={currentChat}
            />
            <div ref={messageRef}/>
          </div>
          <div>
            <Box borderTop={1}>
              <Sender
                text={newMessageText}
                file={newMessageFile}
                onTextChange={text => {
                  setNewMessageText(text);
                  draft.text = text;
                }}
                onFileChange={file => {
                  setNewMessageFile(file);
                  draft.file = file;
                }}
                onActivate={async () => {
                  await sendMessage(newMessageText, newMessageFile);
                  setNewMessageText('');
                  setNewMessageFile(null);
                  clearDraft(currentChatId);
                }}
              />
            </Box>
          </div>
        </>;
    } else {
      content =
        <Box borderRadius={50} className={classes.infoMessage}>
          Выберите чат для отправки сообщения
        </Box>;
    }
    return (
      <div className={classes.rightPane}>
        {content}
      </div>
    );
  };

  return (
    <>
      <BrowserView>
        <div className={classes.root}>
          <Grid container spacing={0}>
            <Grid item xs={12} sm={4}>
              {leftPane()}
            </Grid>
            <Grid item xs={12} sm={8}>
              {rightPane()}
            </Grid>
          </Grid>
        </div>
      </BrowserView>
      <MobileView>
        {currentChat ? rightPane() : leftPane()}
      </MobileView>
    </>
  );
}

export default Chats;
