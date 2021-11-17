import React, { useState } from 'react';
import List from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import { makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import { Chat } from '../../../api/types';
import { formatTime, ellipsizeText } from '../../../utils';
import { getAvatarUrl } from '../../../utils';

type ChatListProps = {
  chats: Chat[];
  onChatSelected: (chat: Chat) => void;
};

const ListItem = withStyles({
  root: {
    '&$selected': {
      backgroundColor: '#419fd9',
    },
    '&$selected:hover': {
      backgroundColor: '#419fd9',
    },
    '&:hover': {
      backgroundColor: '#ebebeb',
    }
  },
  selected: {}
})(MuiListItem);

const useStyles = makeStyles(() =>
  createStyles({
    chatTimestamp: {
      float: 'right',
      verticalAlign: 'middle',
      fontSize: 'smaller'
    },
    chatMessagePreview: {
      float: 'left'
    },
    newMessageBadge: {
      float: 'right'
    }
  }),
);

const ChatList = (props: ChatListProps) => {
  const [currentChat, setCurrentChat] = useState(0);
  const classes = useStyles();

  return (
    <List>
      {
        props.chats.map(
          x => (
            <React.Fragment key={x.id}>
              <ListItem
                button
                onClick={() => {
                  setCurrentChat(x.id);
                  props.onChatSelected(x);
                }}
                selected={x.id === currentChat}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={x.firstName}
                    src={getAvatarUrl(x.avatarUrl)}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <>
                      {x.firstName}
                      <Typography className={classes.chatTimestamp}>
                        {formatTime(x.lastMessageDate)}
                        &nbsp;
                      </Typography>
                    </>
                  }
                  secondary={
                    <Badge
                      color="secondary"
                      variant="dot"
                      invisible={!x.lastMessageNew}
                    >
                      {ellipsizeText(x.lastMessageText, 50)}
                    </Badge>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          )
        )
      }
    </List>
  );
}

export default ChatList;
