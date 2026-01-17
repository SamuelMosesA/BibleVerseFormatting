// home.tsx

import React, { useState, useEffect } from 'react';
import { Center, Stack, Button, Group } from '@mantine/core';
import { HeaderWithKey } from '../components/Header/HeaderWithKey';
import { BibleInputParams } from '../components/BibleInputParams/BibleInputParams';
import { FetchDataButton } from '../components/FetchDataButton/FetchData';
import { FormattedChunk } from '../components/FormattedChunk/FormattedChunk';
import { processAndRenderVerses, generateRichTextHTML, renderHeadingCanvas } from '../data/verse_chunking';
import { FormattedChunkType, InputParamState, Verse } from '@/data/types';
import { get_bible_verses_from_api } from '@/data/esv_bible_api_data';
import logoUrl from '@/assets/logo.png';

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
  const [boxHeight, setBoxHeight] = useState<number>(287);
  const [boxWidth, setBoxWidth] = useState<number>(1920);
  const [fontName, setFontName] = useState<string>('Martel');
  const [fontSize, setFontSize] = useState<number>(40);
  const [lineHeightMult, setLineHeightMult] = useState<number>(1.4);
  const [includeLogo, setIncludeLogo] = useState<boolean>(false);

  return { biblePassage, setBiblePassage, boxHeight, setBoxHeight, boxWidth, setBoxWidth, fontName, setFontName, fontSize, setFontSize, lineHeightMult, setLineHeightMult, includeLogo, setIncludeLogo };
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

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = src;
    });
  };

  const handleFetchAndProcess = async () => {
    if (!inputParams.biblePassage || !password) {return;}
    try {
      const passages = inputParams.biblePassage
        .split(',')
        .map((passage) => passage.trim())
        .filter(Boolean);
      if (passages.length === 0) {return;}

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

      const allCanvases: HTMLCanvasElement[] = [];
      const allRichTextData: FormattedChunkType[] = [];
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
          allCanvases.push(headingCanvas);
        }
        allCanvases.push(...renderedCanvases);
        allRichTextData.push(...data);
      }

      setApiVerses(lastVerses);
      setCanvases(allCanvases);
      setRichTextData(allRichTextData);
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

  const getDosDateTime = (date: Date) => {
    const year = Math.max(1980, date.getFullYear());
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = Math.floor(date.getSeconds() / 2);
    const dosTime = (hours << 11) | (minutes << 5) | seconds;
    const dosDate = ((year - 1980) << 9) | (month << 5) | day;
    return { dosTime, dosDate };
  };

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c >>> 0;
    }
    return table;
  })();

  const crc32 = (data: Uint8Array) => {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const createZip = (files: { name: string; data: Uint8Array }[]) => {
    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];
    const centralDirChunks: Uint8Array[] = [];
    let offset = 0;
    const now = new Date();
    const { dosTime, dosDate } = getDosDateTime(now);

    const pushUint16 = (view: DataView, pos: number, value: number) => {
      view.setUint16(pos, value, true);
    };
    const pushUint32 = (view: DataView, pos: number, value: number) => {
      view.setUint32(pos, value, true);
    };

    for (const file of files) {
      const nameBytes = encoder.encode(file.name);
      const crc = crc32(file.data);
      const localHeader = new Uint8Array(30 + nameBytes.length);
      const localView = new DataView(localHeader.buffer);
      pushUint32(localView, 0, 0x04034b50);
      pushUint16(localView, 4, 20);
      pushUint16(localView, 6, 0);
      pushUint16(localView, 8, 0);
      pushUint16(localView, 10, dosTime);
      pushUint16(localView, 12, dosDate);
      pushUint32(localView, 14, crc);
      pushUint32(localView, 18, file.data.length);
      pushUint32(localView, 22, file.data.length);
      pushUint16(localView, 26, nameBytes.length);
      pushUint16(localView, 28, 0);
      localHeader.set(nameBytes, 30);

      chunks.push(localHeader, file.data);

      const centralHeader = new Uint8Array(46 + nameBytes.length);
      const centralView = new DataView(centralHeader.buffer);
      pushUint32(centralView, 0, 0x02014b50);
      pushUint16(centralView, 4, 20);
      pushUint16(centralView, 6, 20);
      pushUint16(centralView, 8, 0);
      pushUint16(centralView, 10, 0);
      pushUint16(centralView, 12, dosTime);
      pushUint16(centralView, 14, dosDate);
      pushUint32(centralView, 16, crc);
      pushUint32(centralView, 20, file.data.length);
      pushUint32(centralView, 24, file.data.length);
      pushUint16(centralView, 28, nameBytes.length);
      pushUint16(centralView, 30, 0);
      pushUint16(centralView, 32, 0);
      pushUint16(centralView, 34, 0);
      pushUint16(centralView, 36, 0);
      pushUint32(centralView, 38, 0);
      pushUint32(centralView, 42, offset);
      centralHeader.set(nameBytes, 46);

      centralDirChunks.push(centralHeader);
      offset += localHeader.length + file.data.length;
    }

    const centralDirSize = centralDirChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const centralDirOffset = offset;
    chunks.push(...centralDirChunks);

    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    pushUint32(endView, 0, 0x06054b50);
    pushUint16(endView, 4, 0);
    pushUint16(endView, 6, 0);
    pushUint16(endView, 8, files.length);
    pushUint16(endView, 10, files.length);
    pushUint32(endView, 12, centralDirSize);
    pushUint32(endView, 16, centralDirOffset);
    pushUint16(endView, 20, 0);
    chunks.push(endRecord);

    return new Blob(chunks, { type: 'application/zip' });
  };

  const handleDownloadAll = async () => {
    if (canvases.length === 0) {return;}
    try {
      const files = await Promise.all(
        canvases.map(async (canvas, index) => {
          const name = `${baseFileName || 'bible-passage'}-${index + 1}.png`;
          const blob = await getCanvasBlob(canvas);
          const arrayBuffer = await blob.arrayBuffer();
          return { name, data: new Uint8Array(arrayBuffer) };
        })
      );
      const zipBlob = createZip(files);
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

      {canvases.length > 0 && (
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
                      padding: '0 1rem', // Add some padding on mobile
                    }}
        >
          {canvases.map((canvas, index) => (
            <FormattedChunk
              key={index}
              canvas={canvas}
              downloadName={
                `${baseFileName || 'bible-passage'}-${index + 1}.png`
              }
            />
          ))}
        </Stack>
      </Center>
    </>
  );
}
