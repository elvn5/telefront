import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import { Link as RouterLink } from 'react-router-dom';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import MailIcon from '@material-ui/icons/Mail';
import ChatIcon from '@material-ui/icons/Chat';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import api from './api/service';

const useStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 1
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  alignRight: {
    marginLeft: 'auto'
  }
}));

type NavBarProps = {
  onLogOut: () => void;
};

const NavBar = (props: NavBarProps) => {
  const classes = useStyles();

  const logout = async () => {
    await api.logout();
    props.onLogOut();
  }

  return (
    <div className={classes.root}>
      <AppBar position='static'>
        <Toolbar variant='dense'>
          <Button
            className={classes.menuButton}
            size='small'
            color='inherit'
            startIcon={<ChatIcon/>}
            component={RouterLink}
            to='/'
          >
            Диалоги
          </Button>
          <Button
            className={classes.menuButton}
            size='small'
            color='inherit'
            startIcon={<MailIcon/>}
            component={RouterLink}
            to='/broadcast'
          >
            Рассылка
          </Button>
          <Button
            className={classes.alignRight}
            size='small'
            color='inherit'
            startIcon={<ExitToAppIcon/>}
            onClick={logout}
          >
            Выйти
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default NavBar;
