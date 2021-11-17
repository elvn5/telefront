import { useState, useEffect } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { Bot } from '../api/types';
import api from '../api/service';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      margin: theme.spacing(2)
    }
  }),
);

type BotSelectProps = {
  onBotIdChanged: (botId: number) => void;
  currentBot: number;
  label?: boolean;
};

const BotSelect = (props: BotSelectProps) => {
  const classes = useStyles();

  const [bots, setBots] = useState<Bot[]>([]);

  useEffect(() => {
    const updateBots = async () => {
      const bots = await api.getBots();
      setBots(bots.sort((a, b) => a.id - b.id));
    };

    updateBots();
  }, []);


  if (props.currentBot <= 0 && bots.length > 0) {
    props.onBotIdChanged(bots[0].id);
  }

  return (
    <FormControl
      variant='outlined'
      className={classes.root}
    >
      {props.label
        ? <InputLabel id='bot-select-label'>Выберите бота</InputLabel>
        : <></>
      }
      <Select
        value={props.currentBot.toFixed()}
        onChange={event => {
          props.onBotIdChanged(Number(event.target.value));
        }}
        labelId={props.label ? 'bot-select-label' : undefined}
      >
        {bots.map(
          x => <MenuItem key={x.id} value={x.id}>@{x.username}</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

export default BotSelect;
