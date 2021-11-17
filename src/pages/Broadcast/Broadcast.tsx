import { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import BotSelect from '../../common/BotSelect';
import UploadButton from '../../common/UploadButton';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import { makeStyles } from '@material-ui/core/styles';
import MailIcon from '@material-ui/icons/Mail';
import StopIcon from '@material-ui/icons/Stop';
import storage from '../../storage';
import api from '../../api/service';
import { MailingStatus } from '../../api/types';
import { formatTime } from '../../utils';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    //height: '95vh',
    top: '50%',
    position: 'relative',
    padding: theme.spacing(1),
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    flexDirection: 'column',
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
    },
    //backgroundColor: theme.palette.grey[300],
    //fontSize: 'smaller'
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  textField: {
  }
}));

const getMailStatusString = (status: MailingStatus) => {
  if (status.status === 'running') {
    return 'запущена';
  } else if (
    status.status === 'stopped'
    && status.processed === status.total
  ) {
    return 'завершена';
  } else {
    return 'остановлена';
  }
};

const Broadcast = () => {
  const classes = useStyles();

  const [currentBot, setCurrentBot] = useState<number>(
    storage.get().currentBot || 0,
  );
  const [text, setText] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [broadcastUserCount, setBroadcastUserCount] = useState(userCount);
  const [mailStatus, setMailStatus] = useState<MailingStatus>({ status: 'idle' });
  const [updater, setUpdater] = useState(0);

  const runUpdater = () =>
    setUpdater(timeout => {
      window.clearInterval(timeout);
      return window.setInterval(async () => {
        const status = await api.getMailingStatus(currentBot);
        setMailStatus(status);
        if (status.status !== 'running') {
          setUpdater(timeout => {
            window.clearInterval(timeout);
            return 0;
          });
        }
      }, 5000);
    });

  useEffect(() => {
    const updateInfo = async () => {
      const chats = await api.getChats(currentBot, 0, 10);
      setUserCount(chats.count);
      setBroadcastUserCount(chats.count);
      const status = await api.getMailingStatus(currentBot);
      setMailStatus(status);
      if (status.status === 'running') {
        runUpdater();
      }
    }

    updateInfo();
  }, [currentBot]);

  const onStartClicked = () => {
    const startBroadcasting = async () => {
      await api.startMailing(
        currentBot,
        text,
        broadcastUserCount,
        file
      );
      setText('');
      setFile(null);
      setMailStatus(await api.getMailingStatus(currentBot));
      runUpdater();
    };

    startBroadcasting();
  };

  const onStopClicked = () => {
    const stopBroadcasting = async () => {
      await api.stopMailing(currentBot);
      setMailStatus(await api.getMailingStatus(currentBot));
    };

    stopBroadcasting();
  };

  return (
    <div className={classes.root}>
      <BotSelect
        onBotIdChanged={botId => {
          setCurrentBot(botId);
          storage.update({ currentBot: botId });
        }}
        currentBot={currentBot}
      />
      <TableContainer>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Всего пользователей в боте</TableCell>
              <TableCell>{userCount}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Статус рассылки</TableCell>
              <TableCell>
                {getMailStatusString(mailStatus)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Время запуска рассылки</TableCell>
              <TableCell>
                {'started' in mailStatus
                  ? formatTime(mailStatus.started)
                  : '-'
                }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Время остановки рассылки:</TableCell>
              <TableCell>
                {'stopped' in mailStatus
                  ? formatTime(mailStatus.stopped)
                  : '-'
                }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Прогресс рассылки</TableCell>
              <TableCell>
                {mailStatus.status !== 'idle'
                  ? `${mailStatus.processed}/${mailStatus.total}`
                  : '-'
                }
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <TextField
        type='number'
        label='Количество пользователей для рассылки:'
        value={broadcastUserCount}
        disabled={mailStatus.status === 'running'}
        variant='outlined'
        onChange={event => {
          const num = Number(event.target.value);
          if (num <= userCount && num > 0) {
            setBroadcastUserCount(num);
          } else {
            event.preventDefault();
          }
        }}
      />
      <TextField
        className={classes.textField}
        variant='outlined'
        multiline
        disabled={mailStatus.status === 'running'}
        label='Текст сообщения'
        value={text}
        rows={10}
        onChange={event => setText(event.target.value)}
      />
      <div className={classes.flexRow}>
        {mailStatus.status === 'running'
          ? (
            <Button
              startIcon={<StopIcon/>}
              color='secondary'
              onClick={onStopClicked}
              fullWidth
              disabled={mailStatus.status !== 'running'}
            >
              Остановить рассылку
            </Button>
          )
          : (
            <>
              <UploadButton file={file} onChange={setFile}/>
              <Button
                startIcon={<MailIcon/>}
                color='primary'
                onClick={onStartClicked}
                fullWidth
                disabled={text.length === 0}
              >
                Начать рассылку
              </Button>
            </>
          )
        }
      </div>
    </div>
  );
};

export default Broadcast;
