
import { TextInput, Container, Flex, Stack } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { InputParamState } from '../../data/input_params';
import classes from './BibleInputParams.module.css'

function InputLabel(props: PropsWithChildren){
    return <div className={classes.input_label}>{props.children}</div>
}

import { Grid, SimpleGrid } from '@mantine/core';

export const BibleInputParams: React.FC<InputParamState> = ({
    biblePassage,
    setBiblePassage,
    boxHeight,
    setBoxHeight,
    boxWidth,
    setBoxWidth,
    fontUrl,
    setFontUrl,
    fontSize,
    setFontSize,

}) => {

  return (
    <Container my="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Flex direction="column" className={classes.bible_passage_group}
                justify="center" align="center" >
                    <div className={classes.bible_passage_input_label}>Bible Passage</div>
                    <TextInput 
                        placeholder="Genesis 1:1-Genesis 3:1"
                        value={biblePassage}
                        onChange={(e) => setBiblePassage(e.target.value)}
                    />
                </Flex>
        <Grid gutter="md">
          <Grid.Col span={6}>
                <Flex direction="column" className={classes.input_group}
                justify="center" align="center">
                <Stack>
                    <div>
                        <InputLabel>Box Height</InputLabel>
                        <TextInput
                            placeholder="in px"
                            type='number'
                        value={boxHeight}
                        onChange={(e) => setBoxHeight(e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel>Box Width</InputLabel>
                        <TextInput
                            placeholder="in px"
                            type='number'
                        value={boxWidth}
                        onChange={(e) => setBoxWidth(e.target.value)}
                        />
                    </div>
                </Stack>
                </Flex>
          </Grid.Col>
          <Grid.Col span={6}>
                <Flex direction="column" className={classes.input_group}
                justify="center" align="center">
                <Stack >
                    <div>
                        <InputLabel>Google Fonts URL</InputLabel>
                        <TextInput
                            placeholder="paste URL"
                        value={fontUrl}
                        onChange={(e) => setFontUrl(e.target.value)}
                        />
                    </div>
                    <div>
                        <InputLabel>Font Size</InputLabel>
                        <TextInput
                            placeholder="in px"
                            type='number'
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        />
                    </div>
                </Stack>
                </Flex>
          </Grid.Col>
        </Grid>
      </SimpleGrid>
    </Container>
  );
}
