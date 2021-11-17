import TelegramLoginWidget, { ITelegramData } from 'react-telegram-login';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import api from '../api/service';
import ws from '../api/websocket';
import storage from '../storage';

const useStyles = makeStyles(() =>
  createStyles({
    inner: {
      display: 'flex',
      justifyContent: 'center',
    },
    outer: {
      position: 'absolute',
      top: '50%',
      width: '100%'
    }
  })
);

type LoginPageProps = {
  onTokenReceive: (token: string) => void;
};

const LoginPage = (props: LoginPageProps) => {
  const classes = useStyles();

  return (
    <div className={classes.outer}>
      <div className={classes.inner}>
        <TelegramLoginWidget
          dataOnauth={async (data: ITelegramData) => {
            const token = await api.login(data);
            if (token) {
              storage.update({ token });
              ws.authorize();
              props.onTokenReceive(token);
            }
          }}
          botName='myCc_gen_bot'
        />
      </div>
    </div>
  );
};

export default LoginPage;
