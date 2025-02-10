
import React from 'react';
import { Center, Button } from '@mantine/core';
import classes from './FetchData.module.css'

export interface FetchDataButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export function FetchDataButton({ onClick }: FetchDataButtonProps) {
  return (
    <Center className={classes.fetch_button}>
      <Button color="pink" size="lg" w="200px" onClick={onClick}>
        Fetch Data
      </Button>
    </Center>
  );
}