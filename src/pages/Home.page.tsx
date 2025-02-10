import React, { useState, useEffect } from 'react';
import { Center, Stack } from '@mantine/core';
// Assume these components/hooks are defined/imported from your project
import { HeaderWithKey } from '../components/Header/HeaderWithKey';
import { BibleInputParams } from '../components/BibleInputParams/BibleInputParams';
import { FetchDataButton} from '../components/FetchDataButton/FetchData';
import { FormattedChunk } from '../components/FormattedChunk/FormattedChunk';
import { useInputParams } from '../data/input_params';
import  chunkVerses, { FormattedChunkType, Verse } from '../data/verse_chunking'; // The helper function from the previous example

/**
 * Simulate an API call that accepts a bible passage string and returns verses
 * in the form { verse_number: verse_text }.
 * In a real app you’d fetch data from your backend.
 */
const getVersesFromPassage = async (
  biblePassage: string
): Promise<Verse[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {verseNumber:"1",text:"In the beginning God created the heaven and the earth."},
        {verseNumber:"2",text:"And the earth was without form, and void; and darkness was upon the face of the deep."},
        {verseNumber:"3",text:"And God said, Let there be light: and there was light."},
        {verseNumber:"4",text:"And God saw the light, that it was good: and God divided the light from the darkness."},
        {verseNumber:"5",text:"And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day."},
        {verseNumber:"6",text:"And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters."},
        {verseNumber:"7",text:"And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so."},
        {verseNumber:"8",text:"And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so."},
        {verseNumber:"9",text:"And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good."},
        // Add more verses as needed for testing
      ]);
    }, 500);
  });
};


export function HomePage() {
  const input_params = useInputParams();
  const [chunks, setChunks] = useState<FormattedChunkType[]>([]);
  const [apiVerses, setApiVerses] = useState<Verse[]>([]);
  const [needsFormatting, setNeedsFormatting] = useState<boolean>(false);


 const fetchAndSetBiblePassageData = async () => {
      const data = await getVersesFromPassage(input_params.biblePassage)
      setApiVerses(data);
      setNeedsFormatting(true)
  };


  const handleFormat = async () => {
    if (!input_params.biblePassage) {
      console.error("No bible passage provided!");
      return;
    }

    try {
      const boxWidth = Number(input_params.boxWidth);
      const boxHeight = Number(input_params.boxHeight);
      const fontSize = Number(input_params.fontSize);
      const fontFamily = input_params.fontName;
      const lineHeightMult = Number(input_params.lineHeightMult);
      const formattedChunks = chunkVerses(apiVerses, boxWidth, boxHeight, fontSize, fontFamily, lineHeightMult);
      setChunks(formattedChunks);
      setNeedsFormatting(false);
    } catch (error) {
      console.error("Error formatting verses:", error);
    }
  };


  useEffect(()=>{
    handleFormat()
  },[needsFormatting])


  return (
    <>
      <HeaderWithKey />
      <BibleInputParams {...input_params} />
      <FetchDataButton onClick={fetchAndSetBiblePassageData} />
      <Center mt="2dvh">
        <Stack>
          {chunks.length > 0 ? (
            chunks.map((chunk, index) => (
              <FormattedChunk
                key={index}
                formattedText={chunk}
                boxWidth={input_params.boxWidth}
                boxHeight={input_params.boxHeight}
                fontName={input_params.fontName}
                fontSize={input_params.fontSize}
                lineHeightMult={input_params.lineHeightMult}
              />
            ))
          ) : (
            <div>No formatted chunks to display. Press Format to generate verses.</div>
          )}
        </Stack>
      </Center>
    </>
  );
}