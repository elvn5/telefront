import { useRef, useEffect } from 'react';
import Link from '@material-ui/core/Link';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { ellipsizeText } from '../utils';

const useStyles = makeStyles(() =>
  createStyles({
    fileInput: {
      display: 'none'
    },
  }),
);

type UploadButtonProps = {
  onChange: (file: File | null) => void;
  file: File | null;
  label?: string;
};

const UploadButton = (props: UploadButtonProps) => {
  const classes = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      props.onChange(file);
    }
  };

  const clearFile = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    event.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    props.onChange(null);
  };

  useEffect(() => {
    if (fileInputRef.current && props.file === null) {
      fileInputRef.current.value = '';
    }
  }, [props.file]);

  return (
    <div>
      <input
        className={classes.fileInput}
        id='contained-button-file'
        type='file'
        onChange={onFileSelect}
        ref={fileInputRef}
      />
      <label htmlFor='contained-button-file'>
        <Badge
          color="secondary"
          variant="dot"
          invisible={!props.file}
        >
          {props.label
            ? (
              <Button
                startIcon={<AttachFileIcon/>}
                color='primary'
                component='span'
              >
              {props.label}
              </Button>
            )
            : (
              <IconButton color='primary' component='span'>
                <AttachFileIcon/>
              </IconButton>
            )
          }
        </Badge>
      </label>
    </div>
  )
};

export default UploadButton;
