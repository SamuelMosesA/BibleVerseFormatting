// home.tsx

import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { Button, Center, Group, Stack } from '@mantine/core';
import logoUrl from '@/assets/logo.png';
import { get_bible_verses_from_api } from '@/data/esv_bible_api_data';
import { FormattedChunkType, InputParamState, Verse } from '@/data/types';
import { BibleInputParams } from '../components/BibleInputParams/BibleInputParams';
import { FetchDataButton } from '../components/FetchDataButton/FetchData';
import { FormattedChunk } from '../components/FormattedChunk/FormattedChunk';
import { HeaderWithKey } from '../components/Header/HeaderWithKey';
import {
  generateRichTextHTML,
  processAndRenderVerses,
  renderHeadingCanvas,
} from '../data/verse_chunking';

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

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
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
  const [biblePassage, setBiblePassage] = useState<string>('John 3:16-18, Isaiah 53:1-12');
  const [boxHeight, setBoxHeight] = useState<number>(287);
  const [boxWidth, setBoxWidth] = useState<number>(1920);
  const [fontName, setFontName] = useState<string>('Martel');
  const [fontSize, setFontSize] = useState<number>(40);
  const [lineHeightMult, setLineHeightMult] = useState<number>(1.4);
  const [includeLogo, setIncludeLogo] = useState<boolean>(false);

  return {
    biblePassage,
    setBiblePassage,
    boxHeight,
    setBoxHeight,
    boxWidth,
    setBoxWidth,
    fontName,
    setFontName,
    fontSize,
    setFontSize,
    lineHeightMult,
    setLineHeightMult,
    includeLogo,
    setIncludeLogo,
  };
}

const getVersesFromPassage = async (biblePassage: string, password: string): Promise<Verse[]> => {
  return get_bible_verses_from_api(biblePassage, password);
};

export function HomePage() {
  const inputParams = useInputParams();
  const [, setApiVerses] = useState<Verse[]>([]);
  const [password, setPassword] = useLocalStorage<string>('passkey', '');

  // State to hold slides (canvas + optional rich text data)
  interface SlideData {
    canvas: HTMLCanvasElement;
    richTextChunk?: FormattedChunkType;
  }
  const [slides, setSlides] = useState<SlideData[]>([]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = src;
    });
  };

  const handleFetchAndProcess = async () => {
    if (!inputParams.biblePassage || !password) {
      return;
    }
    try {
      const passages = inputParams.biblePassage
        .split(',')
        .map((passage) => passage.trim())
        .filter(Boolean);
      if (passages.length === 0) {
        return;
      }

      const fontString = `${inputParams.fontSize}px ${inputParams.fontName}`;
      await document.fonts.load(fontString);
      const headingFontString = `${Math.round(inputParams.fontSize * 1.6)}px ${inputParams.fontName}`;
      await document.fonts.load(headingFontString);

      let logoImage: HTMLImageElement | null = null;
      if (inputParams.includeLogo) {
        try {
          logoImage = await loadImage(logoUrl);
        } catch (error) {
          console.error('Failed to load logo image:', error);
        }
      }

      const allSlides: SlideData[] = [];
      let lastVerses: Verse[] = [];

      for (const passage of passages) {
        const verses = await getVersesFromPassage(passage, password);
        lastVerses = verses;

        const { canvases: renderedCanvases, richTextData: data } = processAndRenderVerses(
          verses,
          inputParams.boxWidth,
          inputParams.boxHeight,
          inputParams.fontName,
          inputParams.fontSize,
          inputParams.lineHeightMult,
          { includeLogo: inputParams.includeLogo, logoImage }
        );
        const headingCanvas = renderHeadingCanvas(
          passage,
          inputParams.boxWidth,
          inputParams.boxHeight,
          inputParams.fontName,
          inputParams.fontSize,
          { includeLogo: inputParams.includeLogo, logoImage }
        );
        if (headingCanvas) {
          allSlides.push({ canvas: headingCanvas });
        }
        for (let i = 0; i < renderedCanvases.length; i++) {
          allSlides.push({ canvas: renderedCanvases[i], richTextChunk: data[i] });
        }
      }

      setApiVerses(lastVerses);
      setSlides(allSlides);
    } catch (error) {
      console.error('Error fetching or processing verses:', error);
      setSlides([]);
    }
  };

  const handleCopyRichText = () => {
    const richTextChunks = slides
      .map((s) => s.richTextChunk)
      .filter((c): c is FormattedChunkType => !!c);
    if (richTextChunks.length === 0) {
      return;
    }
    const html = generateRichTextHTML(richTextChunks);
    const blob = new Blob([html], { type: 'text/html' });
    navigator.clipboard
      .write([new ClipboardItem({ 'text/html': blob })])
      .catch((err) => console.error('Failed to copy rich text:', err));
  };

  const baseFileName = inputParams.biblePassage
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        resolve(blob);
      });
    });
  };

  const handleDownloadAll = async () => {
    if (slides.length === 0) {
      return;
    }
    try {
      const zip = new JSZip();

      await Promise.all(
        slides.map(async (slide, index) => {
          const name = `${baseFileName || 'bible-passage'}-${index + 1}.png`;
          const blob = await getCanvasBlob(slide.canvas);
          zip.file(name, blob);
        })
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${baseFileName || 'bible-passage'}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to create zip:', error);
    }
  };

  return (
    <>
      <HeaderWithKey {...{ password, setPassword }} />
      <BibleInputParams {...inputParams} />
      <Center>
        <FetchDataButton onClick={handleFetchAndProcess} />
      </Center>

      {slides.length > 0 && (
        <Center mt="xl" mb="md">
          <Group>
            <Button onClick={handleCopyRichText} size="md">
              Copy All Verses as Rich Text
            </Button>
            <Button variant="light" onClick={handleDownloadAll} size="md">
              Download All Images
            </Button>
          </Group>
        </Center>
      )}

      <Center mt="2dvh" mx="auto">
        <Stack
          style={{
            maxWidth: '100%',
            padding: '0 1rem',
          }}
        >
          {slides.map((slide, index) => (
            <FormattedChunk
              key={index}
              canvas={slide.canvas}
              downloadName={`${baseFileName || 'bible-passage'}-${index + 1}.png`}
              richTextChunk={slide.richTextChunk}
            />
          ))}
        </Stack>
      </Center>
    </>
  );
}
