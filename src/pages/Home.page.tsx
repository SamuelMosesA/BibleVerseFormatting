import React, { useState, useEffect } from 'react';
import { Center, Stack } from '@mantine/core';
// Assume these components/hooks are defined/imported from your project
import { HeaderWithKey } from '../components/Header/HeaderWithKey';
import { BibleInputParams } from '../components/BibleInputParams/BibleInputParams';
import { FetchDataButton} from '../components/FetchDataButton/FetchData';
import { FormattedChunk } from '../components/FormattedChunk/FormattedChunk';
import { useInputParams } from '../data/input_params';
import  chunkVerses, {  } from '../data/verse_chunking'; // The helper function from the previous example
import { FormattedChunkType, Verse } from "@/data/types";
import { get_bible_verses_from_api } from '@/data/api_request';

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
      resolve(
          get_bible_verses_from_api(biblePassage)
      );
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
    console.log("needs formatting")
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