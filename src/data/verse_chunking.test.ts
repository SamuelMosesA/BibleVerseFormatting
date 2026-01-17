import { readFileSync } from 'node:fs';
import { describe, expect, beforeAll, it } from 'vitest';
import { processAndRenderVerses } from './verse_chunking';
import type { FormattedLine, Verse } from './types';

const DEFAULTS = {
  boxWidth: 1920,
  boxHeight: 287,
  fontName: 'Martel',
  fontSize: 40,
  lineHeightMult: 1.4,
};

const unescapeApiText = (text: string) =>
  text.replace(/\\t/g, '\t').replace(/\\n/g, '\n');

const parsePassage = (rawText: string): Verse[] => {
  const decoded = unescapeApiText(rawText).replace(/\n\s*\n/g, '\n');
  const regex = /\[(\d+)\]([^\[\]]+)/g;
  const verses: Verse[] = [];
  for (const match of decoded.matchAll(regex)) {
    verses.push({
      verseNumber: match[1],
      text: match[2],
    });
  }
  return verses;
};

const lineToString = (line: FormattedLine) => {
  const text = line
    .map((word) => (word.isBold ? `[${word.text.trim()}]` : word.text))
    .join(' ')
    .replace(/\t/g, '\\t')
    .replace(/\s+/g, ' ')
    .trim();
  return text;
};

const chunkToStrings = (chunk: FormattedLine[]) => chunk.map(lineToString);

beforeAll(() => {
  const mockContext = {
    font: '',
    fillStyle: '',
    measureText: (text: string) => ({ width: text.length * 10 }),
    fillText: () => undefined,
    drawImage: () => undefined,
    fillRect: () => undefined,
  } as unknown as CanvasRenderingContext2D;

  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    value: () => mockContext,
  });
});

describe('processAndRenderVerses', () => {
  it('does not insert blank lines between verses when source text has none', () => {
    const raw = readFileSync('src/data/tmp.text', 'utf8');
    const verses = parsePassage(raw);
    const { richTextData } = processAndRenderVerses(
      verses,
      DEFAULTS.boxWidth,
      DEFAULTS.boxHeight,
      DEFAULTS.fontName,
      DEFAULTS.fontSize,
      DEFAULTS.lineHeightMult
    );

    const allLines = richTextData.flatMap((chunk) => chunkToStrings(chunk.formattedText));
    expect(allLines).not.toContain('');
  });

  it('splits the example into multiple slides at default size', () => {
    const raw = readFileSync('src/data/tmp.text', 'utf8');
    const verses = parsePassage(raw);
    const expandedVerses = verses.concat(verses);
    const { richTextData } = processAndRenderVerses(
      expandedVerses,
      DEFAULTS.boxWidth,
      DEFAULTS.boxHeight,
      DEFAULTS.fontName,
      DEFAULTS.fontSize,
      DEFAULTS.lineHeightMult
    );

    const slideLines = richTextData.map((chunk) => chunkToStrings(chunk.formattedText));
    expect(slideLines).toMatchInlineSnapshot(`
      [
        [
          "[1] Inasmuch as many have undertaken to compile a narrative of the things that have been accomplished among us, [2] just as those who from the beginning were eyewitnesses and ministers of the",
          "word have delivered them to us, [3] it seemed good to me also, having followed all things closely for some time past, to write an orderly account for you, most excellent Theophilus, [4] that you",
          "may have certainty concerning the things you have been taught.",
          "\\t\\t [5] In the days of Herod, king of Judea, there was a priest named Zechariah, of the division of Abijah. And he had a wife from the daughters of Aaron, and her name was Elizabeth. [6] And they",
          "were both righteous before God, walking blamelessly in all the commandments and statutes of the Lord.",
        ],
        [
          "[1] Inasmuch as many have undertaken to compile a narrative of the things that have been accomplished among us, [2] just as those who from the beginning were eyewitnesses and ministers of the",
          "word have delivered them to us, [3] it seemed good to me also, having followed all things closely for some time past, to write an orderly account for you, most excellent Theophilus, [4] that you",
          "may have certainty concerning the things you have been taught.",
          "\\t\\t [5] In the days of Herod, king of Judea, there was a priest named Zechariah, of the division of Abijah. And he had a wife from the daughters of Aaron, and her name was Elizabeth. [6] And they",
          "were both righteous before God, walking blamelessly in all the commandments and statutes of the Lord.",
        ],
      ]
    `);
  });
});
