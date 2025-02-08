import React, { useState, useEffect } from 'react';
import { Center, Stack } from '@mantine/core';
// Assume these components/hooks are defined/imported from your project
import { HeaderWithKey } from '../components/Header/HeaderWithKey';
import { BibleInputParams } from '../components/BibleInputParams/BibleInputParams';
import { FormatButton} from '../components/SubmitButton/SubmitButton';
import { FormattedChunk } from '../components/FormattedChunk/FormattedChunk';
import { useInputParams } from '../data/input_params';
import  chunkVerses from '../data/verse_chunking'; // The helper function from the previous example

/**
 * Simulate an API call that accepts a bible passage string and returns verses
 * in the form { verse_number: verse_text }.
 * In a real app you’d fetch data from your backend.
 */
const getVersesFromPassage = async (
  biblePassage: string
): Promise<{ [verse: string]: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        "1": "In the beginning God created the heaven and the earth.",
        "2": "And the earth was without form, and void; and darkness was upon the face of the deep.",
        "3": "And God said, Let there be light: and there was light.",
        "4": "And God saw the light, that it was good: and God divided the light from the darkness.",
        "5": "And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.",
        "6": "And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.",
        "7": "And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.",
        "8": "And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.",
        "9": "And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.",
        // Add more verses as needed for testing
      });
    }, 500);
  });
};


export function HomePage() {
  const input_params = useInputParams();
  const [chunks, setChunks] = useState<string[]>([]);
  const [apiVerses, setApiVerses] = useState<{[verse: string]:string}>({});

  useEffect(() => {
    console.log("Input parameters:", input_params);
  }, [input_params]);

  useEffect(() => { 
    const fetchAndSetBiblePassageData = async () => {
      const data = await getVersesFromPassage(input_params.biblePassage)
      setApiVerses(data);
  };
    fetchAndSetBiblePassageData()
  }, [input_params.biblePassage])


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
      const formattedChunks = chunkVerses(apiVerses, boxWidth, boxHeight, fontSize, fontFamily);
      setChunks(formattedChunks);
    } catch (error) {
      console.error("Error formatting verses:", error);
    }
  };

  useEffect(() => {
    handleFormat()
  }, [apiVerses, input_params.boxHeight, input_params.boxWidth, input_params.fontName, input_params.fontSize])

  return (
    <>
      <HeaderWithKey />
      <BibleInputParams {...input_params} />
      <FormatButton onClick={handleFormat} />
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