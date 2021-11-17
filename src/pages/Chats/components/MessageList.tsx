import React from 'react';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import ListItem from '@material-ui/core/ListItem';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { Message, MediaType, Chat } from '../../../api/types';
import api from '../../../api/service';
import { formatTime } from '../../../utils';
import { isMobile } from 'react-device-detect';

type MessageListProps = {
  messages: Message[];
  chat: Chat;
  loading: boolean;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    timestamp: {
      fontSize: 'smaller',
      color: theme.palette.grey[600],
      marginBottom: theme.spacing(1),
      float: 'right'
    },
    title: {
      fontWeight: 'bold',
      color: theme.palette.grey[600],
      marginBottom: theme.spacing(1)
    },
    textContent: {
      wordWrap: 'break-word'
    },
    msgFrom: {
      width: isMobile ? '90%' : '50%',
      margin: theme.spacing(2),
      display: 'inline-block',
      position: 'relative',
      left: '0px',
      backgroundColor: '#ffffff',
    },
    msgTo: {
      width: isMobile ? '90%' : '50%',
      margin: theme.spacing(2),
      display: 'inline-block',
      position: 'relative',
      right: isMobile ? '0px' : '-49%',
      backgroundColor: '#def1fd',
    },
    mediaContainer: {
      height: '160px',
      width: 'fit-content',
      padding: '10px',
      backgroundColor: '#f4f5f9',
      marginBottom: theme.spacing(1)
    },
    image: {
      maxHeight: '140px'
    },
    loading: {
      textAlign: 'center',
      fontSize: 14,
      color: theme.palette.grey[400],
    },
  }),
);

const MessageList = (props: MessageListProps) => {
  const classes = useStyles();

  const messageMedia = (msg: Message) => {
    if (!msg.media) {
      return <></>;
    }
    let elt: React.ReactElement;

    switch (msg.media.type) {
      case MediaType.Image:
        elt = (
          <img
            alt="message media"
            className={classes.image}
            src={api.getFileUrl(msg.media.id)}/>
        );
        break;
      case MediaType.Video:
        elt = (
          <video
            controls={true}
            className={classes.image}>
            <source src={api.getFileUrl(msg.media.id)}/>
          </video>
        );
        break;
    }

    return (
      <Box
        borderColor='primary'
        borderRadius={10}
        className={classes.mediaContainer}
      >
        <a
          rel="noreferrer"
          target="_blank"
          href={api.getFileUrl(msg.media.id)}
        >
          {elt}
        </a>
      </Box>
    );
  }

  return (
    <List>
      {props.loading
        ? <div className={classes.loading}>Loading...</div>
        : <></>
      }
      {
        props.messages.map(
          x => (
            <ListItem key={x.id}>
              <Card className={x.from ? classes.msgFrom : classes.msgTo}>
                <CardContent>
                  <Typography className={classes.title}>
                    {x.from ? props.chat.firstName : 'Вы'}
                  </Typography>
                  {messageMedia(x)}
                  <Typography className={classes.textContent}>
                    {x.text}
                  </Typography>
                  <Typography className={classes.timestamp}>
                    {formatTime(x.timestamp)}
                  </Typography>
                </CardContent>
              </Card>
            </ListItem>
          )
        )
      }
    </List>
  );
}

export default MessageList;
