
import React from 'react';
import { Center, Button } from '@mantine/core';
import classes from './SubmitButton.module.css'

export interface FormatButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export function FormatButton({ onClick }: FormatButtonProps) {
  return (
    <Center className={classes.format_button}>
      <Button color="pink" size="lg" w="200px" onClick={onClick}>
        Format
      </Button>
    </Center>
  );
}