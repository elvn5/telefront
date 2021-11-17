import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Send from '@material-ui/icons/Send';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import UploadButton from '../../../common/UploadButton';

type SenderProps = {
  text: string;
  file: File | null;
  onTextChange: (text: string) => void;
  onFileChange: (file: File | null) => void;
  onActivate: () => void;
};

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'row',
      padding: theme.spacing(1)
    }
  }),
);

const Sender = (props: SenderProps) => {
  const classes = useStyles();

  const sendMessageHandler = () => {
    props.onActivate();
  };

  const keyDownHandler = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      sendMessageHandler();
      event.preventDefault();
    }
  };

  return (
    <Toolbar className={classes.root}>
      <UploadButton file={props.file} onChange={props.onFileChange}/>
      <TextField
        multiline
        value={props.text}
        onChange={event => props.onTextChange(event.target.value)}
        onKeyDown={keyDownHandler}
        fullWidth={true}
        placeholder='Введите текст сообщения...'
      />
      <IconButton
        color='primary'
        onClick={sendMessageHandler}
        disabled={props.text.length === 0}
      >
        <Send/>
      </IconButton>
    </Toolbar>
  );
};

export default Sender;
