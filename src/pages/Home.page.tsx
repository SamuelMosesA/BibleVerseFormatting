import { HeaderWithKey } from '../components/Header/HeaderWithKey';
import { BibleInputParams} from '../components/BibleInputParams/BibleInputParams';
import { FormatButton } from '../components/SubmitButton/SubmitButton';
import { FormattedChunk } from '../components/FormattedChunk/FormattedChunk';
import { Center, Stack} from '@mantine/core'
import { useInputParams } from '../data/input_params';
import { useEffect } from 'react';

export function HomePage() {
  let input_params = useInputParams(); 

  useEffect(() => {
    console.log(input_params)
  },[input_params])

  return (
    <>
      <HeaderWithKey />
      <BibleInputParams {...input_params} />
      <FormatButton/>
      <Center mt='2dvh'>
        <Stack>
          <FormattedChunk formattedText='sdfsd' /> 
          <FormattedChunk formattedText='sdfsdf'/> 
        </Stack>
      </Center>
    </>
  );
}
