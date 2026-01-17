import { PropsWithChildren} from 'react';
import { Checkbox, Container, Flex, Grid, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { InputParamState } from '@/data/types';
import classes from './BibleInputParams.module.css';

function InputLabel(props: PropsWithChildren) {
  return <div className={classes.input_label}>{props.children}</div>;
}

export const BibleInputParams: React.FC<InputParamState> = ({
  biblePassage,
  setBiblePassage,
  boxHeight,
  setBoxHeight,
  boxWidth,
  setBoxWidth,
  fontName: fontUrl,
  setFontName: setFontUrl,
  fontSize,
  setFontSize,
  lineHeightMult,
  setLineHeightMult,
  includeLogo,
  setIncludeLogo,
}) => {
  return (
    <Container my="md">
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Flex
          direction="column"
          className={classes.bible_passage_group}
          justify="center"
          align="center"
        >
          <div className={classes.bible_passage_input_label}>Bible Passage</div>
          <TextInput
            placeholder="Genesis 1:1-Genesis 3:1"
            value={biblePassage}
            onChange={(e) => setBiblePassage(e.target.value)}
          />
        </Flex>
        <Grid gutter="md">
          <Grid.Col span={6}>
            <Flex
              direction="column"
              className={classes.input_group}
              justify="center"
              align="center"
            >
              <Stack>
                <div>
                  <InputLabel>Box Height</InputLabel>
                  <TextInput
                    placeholder="in px"
                    type="number"
                    value={boxHeight}
                    onChange={(e) => setBoxHeight(Number(e.target.value))}
                  />
                </div>
                <div>
                  <InputLabel>Box Width</InputLabel>
                  <TextInput
                    placeholder="in px"
                    type="number"
                    value={boxWidth}
                    onChange={(e) => setBoxWidth(Number(e.target.value))}
                  />
                </div>
              </Stack>
            </Flex>
          </Grid.Col>
          <Grid.Col span={6}>
            <Flex
              direction="column"
              className={classes.input_group}
              justify="center"
              align="center"
            >
              <Stack>
                <div>
                  <InputLabel>Google Font Name</InputLabel>
                  <TextInput
                    placeholder="paste Name"
                    value={fontUrl}
                    onChange={(e) => setFontUrl(e.target.value)}
                  />
                </div>
                <div>
                  <InputLabel>Font Size</InputLabel>
                  <TextInput
                    placeholder="in px"
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </div>
                <div>
                  <InputLabel>Line Height Mult</InputLabel>
                  <TextInput
                    placeholder="float 1.2"
                    type="number"
                    value={lineHeightMult}
                    onChange={(e) => setLineHeightMult(Number(e.target.value))}
                  />
                </div>
                <div>
                  <InputLabel>Logo</InputLabel>
                  <Checkbox
                    label="Include logo"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.currentTarget.checked)}
                  />
                </div>
              </Stack>
            </Flex>
          </Grid.Col>
        </Grid>
      </SimpleGrid>
    </Container>
  );
};
