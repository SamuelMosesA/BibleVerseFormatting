// home.tsx

import React, { useState, useEffect } from 'react';
import { Center, Stack, Button, Group } from '@mantine/core';
import { HeaderWithKey } from '../components/Header/HeaderWithKey';
import { BibleInputParams } from '../components/BibleInputParams/BibleInputParams';
import { FetchDataButton } from '../components/FetchDataButton/FetchData';
import { FormattedChunk } from '../components/FormattedChunk/FormattedChunk';
import { processAndRenderVerses, generateRichTextHTML } from '../data/verse_chunking';
import { FormattedChunkType, InputParamState, Verse } from '@/data/types';
import { get_bible_verses_from_api } from '@/data/esv_bible_api_data';

function getStorageValue<T>(key: string, defaultValue: T): T {
  // Getting stored value
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing JSON from localStorage', error);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // Storing value
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export function useInputParams(): InputParamState {
  const [biblePassage, setBiblePassage] = useState<string>('John 3:16-18');
  const [boxHeight, setBoxHeight] = useState<number>(220);
  const [boxWidth, setBoxWidth] = useState<number>(1100);
  const [fontName, setFontName] = useState<string>('Solway');
  const [fontSize, setFontSize] = useState<number>(24);
  const [lineHeightMult, setLineHeightMult] = useState<number>(1.4);

  return { biblePassage, setBiblePassage, boxHeight, setBoxHeight, boxWidth, setBoxWidth, fontName, setFontName, fontSize, setFontSize, lineHeightMult, setLineHeightMult };
}

const getVersesFromPassage = async (biblePassage: string, password: string): Promise<Verse[]> => {
    return get_bible_verses_from_api(biblePassage, password);
};

export function HomePage() {
  const inputParams = useInputParams();
  const [, setApiVerses] = useState<Verse[]>([]);
  const [password, setPassword] = useLocalStorage<string>('passkey', '');

  // State to hold the final rendered canvases and the data for HTML export
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
  const [richTextData, setRichTextData] = useState<FormattedChunkType[]>([]);

  const handleFetchAndProcess = async () => {
    if (!inputParams.biblePassage || !password) {return;}
    try {
      const verses = await getVersesFromPassage(inputParams.biblePassage, password);
      setApiVerses(verses);
      
      const fontString = `${inputParams.fontSize}px ${inputParams.fontName}`;
      await document.fonts.load(fontString);

      // This one function now does all the work
      const { canvases: renderedCanvases, richTextData: data } = processAndRenderVerses(
        verses,
        inputParams.boxWidth,
        inputParams.boxHeight,
        inputParams.fontName,
        inputParams.fontSize,
        inputParams.lineHeightMult
      );
      setCanvases(renderedCanvases);
      setRichTextData(data);

    } catch (error) {
      console.error("Error fetching or processing verses:", error);
      setCanvases([]);
      setRichTextData([]);
    }
  };

  const handleCopyRichText = () => {
    if (richTextData.length === 0) {return;}
    const html = generateRichTextHTML(richTextData);
    const blob = new Blob([html], { type: 'text/html' });
    navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
        .then(() => console.log("HTML copied as rich text!"))
        .catch(err => console.error("Failed to copy rich text:", err));
  };

  return (
    <>
      <HeaderWithKey {...{ password, setPassword }} />
      <BibleInputParams {...inputParams} />
      <Center>
        <FetchDataButton onClick={handleFetchAndProcess} />
      </Center>

      {canvases.length > 0 && (
        <Center mt="xl" mb="md">
            <Button onClick={handleCopyRichText} size="md">
                Copy All Verses as Rich Text
            </Button>
        </Center>
      )}

      <Center mt="2dvh">
        <Stack>
          {canvases.map((canvas, index) => (
            <FormattedChunk
              key={index}
              canvas={canvas}
            />
          ))}
        </Stack>
      </Center>
    </>
  );
}
