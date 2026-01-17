import { beforeAll, describe, expect, it } from 'vitest';
import type { FormattedLine, Verse } from './types';
import { processAndRenderVerses } from './verse_chunking';

const DEFAULTS = {
  boxWidth: 1920,
  boxHeight: 287,
  fontName: 'Martel',
  fontSize: 40,
  lineHeightMult: 1.4,
};

// Inlined test data from tmp.text (Luke 1:1-6)
const LUKE_1_1_6_RAW =
  '\\t\\t[1] Inasmuch as many have undertaken to compile a narrative of the things that have been accomplished among us, [2] just as those who from the beginning were eyewitnesses and ministers of the word have delivered them to us, [3] it seemed good to me also, having followed all things closely for some time past, to write an orderly account for you, most excellent Theophilus, [4] that you may have certainty concerning the things you have been taught.\\n\\n\\t\\t[5] In the days of Herod, king of Judea, there was a priest named Zechariah, of the division of Abijah. And he had a wife from the daughters of Aaron, and her name was Elizabeth. [6] And they were both righteous before God, walking blamelessly in all the commandments and statutes of the Lord.\\n\\n';

// Inlined test data from isa.txt (Isaiah 53:1-12, poetic formatting)
const ISAIAH_53_RAW =
  '"\\t\\t\\t\\t[1] Who has believed what he has heard from us?\\n\\t\\t\\t\\t\\t\\t\\t\\tAnd to whom has the arm of the LORD been revealed?\\n\\t\\t\\t\\t[2] For he grew up before him like a young plant,\\n\\t\\t\\t\\t\\t\\t\\t\\tand like a root out of dry ground;\\n\\t\\t\\t\\the had no form or majesty that we should look at him,\\n\\t\\t\\t\\t\\t\\t\\t\\tand no beauty that we should desire him.\\n\\t\\t\\t\\t[3] He was despised and rejected by men,\\n\\t\\t\\t\\t\\t\\t\\t\\ta man of sorrows and acquainted with grief;\\n\\t\\t\\t\\tand as one from whom men hide their faces\\n\\t\\t\\t\\t\\t\\t\\t\\the was despised, and we esteemed him not.\\n\\t\\t\\t\\t\\n\\t\\t\\t\\t\\n\\t\\t\\t\\t[4] Surely he has borne our griefs\\n\\t\\t\\t\\t\\t\\t\\t\\tand carried our sorrows;\\n\\t\\t\\t\\tyet we esteemed him stricken,\\n\\t\\t\\t\\t\\t\\t\\t\\tsmitten by God, and afflicted.\\n\\t\\t\\t\\t[5] But he was pierced for our transgressions;\\n\\t\\t\\t\\t\\t\\t\\t\\the was crushed for our iniquities;\\n\\t\\t\\t\\tupon him was the chastisement that brought us peace,\\n\\t\\t\\t\\t\\t\\t\\t\\tand with his wounds we are healed.\\n\\t\\t\\t\\t[6] All we like sheep have gone astray;\\n\\t\\t\\t\\t\\t\\t\\t\\twe have turned—every one—to his own way;\\n\\t\\t\\t\\tand the LORD has laid on him\\n\\t\\t\\t\\t\\t\\t\\t\\tthe iniquity of us all.\\n\\t\\t\\t\\t\\n\\t\\t\\t\\t\\n\\t\\t\\t\\t[7] He was oppressed, and he was afflicted,\\n\\t\\t\\t\\t\\t\\t\\t\\tyet he opened not his mouth;\\n\\t\\t\\t\\tlike a lamb that is led to the slaughter,\\n\\t\\t\\t\\t\\t\\t\\t\\tand like a sheep that before its shearers is silent,\\n\\t\\t\\t\\t\\t\\t\\t\\tso he opened not his mouth.\\n\\t\\t\\t\\t[8] By oppression and judgment he was taken away;\\n\\t\\t\\t\\t\\t\\t\\t\\tand as for his generation, who considered\\n\\t\\t\\t\\tthat he was cut off out of the land of the living,\\n\\t\\t\\t\\t\\t\\t\\t\\tstricken for the transgression of my people?\\n\\t\\t\\t\\t[9] And they made his grave with the wicked\\n\\t\\t\\t\\t\\t\\t\\t\\tand with a rich man in his death,\\n\\t\\t\\t\\talthough he had done no violence,\\n\\t\\t\\t\\t\\t\\t\\t\\tand there was no deceit in his mouth.\\n\\t\\t\\t\\t\\n\\t\\t\\t\\t\\n\\t\\t\\t\\t[10] Yet it was the will of the LORD to crush him;\\n\\t\\t\\t\\t\\t\\t\\t\\the has put him to grief;\\n\\t\\t\\t\\twhen his soul makes an offering for guilt,\\n\\t\\t\\t\\t\\t\\t\\t\\the shall see his offspring; he shall prolong his days;\\n\\t\\t\\t\\tthe will of the LORD shall prosper in his hand.\\n\\t\\t\\t\\t[11] Out of the anguish of his soul he shall see and be satisfied;\\n\\t\\t\\t\\tby his knowledge shall the righteous one, my servant,\\n\\t\\t\\t\\t\\t\\t\\t\\tmake many to be accounted righteous,\\n\\t\\t\\t\\t\\t\\t\\t\\tand he shall bear their iniquities.\\n\\t\\t\\t\\t[12] Therefore I will divide him a portion with the many,\\n\\t\\t\\t\\t\\t\\t\\t\\tand he shall divide the spoil with the strong,\\n\\t\\t\\t\\tbecause he poured out his soul to death\\n\\t\\t\\t\\t\\t\\t\\t\\tand was numbered with the transgressors;\\n\\t\\t\\t\\tyet he bore the sin of many,\\n\\t\\t\\t\\t\\t\\t\\t\\tand makes intercession for the transgressors.\\n\\t\\t\\t\\t\\n\\n"';

const JOHN2_13_14 =
  '"\t\t\t\t[13] I am writing to you, fathers,\n\t\t\t\t\t\t\t\tbecause you know him who is from the beginning.\n\t\t\t\tI am writing to you, young men,\n\t\t\t\t\t\t\t\tbecause you have overcome the evil one.\n\t\t\t\tI write to you, children,\n\t\t\t\t\t\t\t\tbecause you know the Father.\n\t\t\t\t[14] I write to you, fathers,\n\t\t\t\t\t\t\t\tbecause you know him who is from the beginning.\n\t\t\t\tI write to you, young men,\n\t\t\t\t\t\t\t\tbecause you are strong,\n\t\t\t\t\t\t\t\tand the word of God abides in you,\n\t\t\t\t\t\t\t\tand you have overcome the evil one.\n\t\t\t\t\n\n"';

const unescapeApiText = (text: string) => text.replace(/\\t/g, '\t').replace(/\\n/g, '\n');

const parsePassage = (rawText: string): Verse[] => {
  const decoded = unescapeApiText(rawText).replace(/\n\s*\n/g, '\n');
  const regex = /\[(\d+)\]([^[\]]+)/g;
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
    const verses = parsePassage(LUKE_1_1_6_RAW);
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
    const verses = parsePassage(LUKE_1_1_6_RAW);
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
          "may have certainty concerning the things you have been taught. [5] In the days of Herod, king of Judea, there was a priest named Zechariah, of the division of Abijah. And he had a wife from the",
          "daughters of Aaron, and her name was Elizabeth. [6] And they were both righteous before God, walking blamelessly in all the commandments and statutes of the Lord. [1] Inasmuch as many have",
          "undertaken to compile a narrative of the things that have been accomplished among us,",
        ],
        [
          "[2] just as those who from the beginning were eyewitnesses and ministers of the word have delivered them to us, [3] it seemed good to me also, having followed all things closely for some time",
          "past, to write an orderly account for you, most excellent Theophilus, [4] that you may have certainty concerning the things you have been taught. [5] In the days of Herod, king of Judea, there",
          "was a priest named Zechariah, of the division of Abijah. And he had a wife from the daughters of Aaron, and her name was Elizabeth. [6] And they were both righteous before God, walking",
          "blamelessly in all the commandments and statutes of the Lord.",
        ],
      ]
    `);
  });

  it('does not produce blank slides for Isaiah 53 (poetic formatting)', () => {
    const verses = parsePassage(ISAIAH_53_RAW);
    const { richTextData } = processAndRenderVerses(
      verses,
      DEFAULTS.boxWidth,
      DEFAULTS.boxHeight,
      DEFAULTS.fontName,
      DEFAULTS.fontSize,
      DEFAULTS.lineHeightMult
    );

    const slideLines = richTextData.map((chunk) => chunkToStrings(chunk.formattedText));

    // Verify no blank lines exist
    const allLines = slideLines.flat();
    expect(allLines).not.toContain('');

    // Snapshot the actual content for verification
    expect(slideLines).toMatchInlineSnapshot(`
      [
        [
          "[1] Who has believed what he has heard from us?",
          "\\t\\t\\t\\t\\t\\t\\t\\t And to whom has the arm of the LORD been revealed? [2] For he grew up before him like a young plant,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and like a root out of dry ground;",
          "\\t\\t\\t\\t he had no form or majesty that we should look at him,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and no beauty that we should desire him.",
        ],
        [
          "[3] He was despised and rejected by men,",
          "\\t\\t\\t\\t\\t\\t\\t\\t a man of sorrows and acquainted with grief;",
          "\\t\\t\\t\\t and as one from whom men hide their faces",
          "\\t\\t\\t\\t\\t\\t\\t\\t he was despised, and we esteemed him not.",
        ],
        [
          "[4] Surely he has borne our griefs",
          "\\t\\t\\t\\t\\t\\t\\t\\t and carried our sorrows;",
          "\\t\\t\\t\\t yet we esteemed him stricken,",
          "\\t\\t\\t\\t\\t\\t\\t\\t smitten by God, and afflicted.",
        ],
        [
          "[5] But he was pierced for our transgressions;",
          "\\t\\t\\t\\t\\t\\t\\t\\t he was crushed for our iniquities;",
          "\\t\\t\\t\\t upon him was the chastisement that brought us peace,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and with his wounds we are healed.",
        ],
        [
          "[6] All we like sheep have gone astray;",
          "\\t\\t\\t\\t\\t\\t\\t\\t we have turned—every one—to his own way;",
          "\\t\\t\\t\\t and the LORD has laid on him",
          "\\t\\t\\t\\t\\t\\t\\t\\t the iniquity of us all.",
        ],
        [
          "[7] He was oppressed, and he was afflicted,",
          "\\t\\t\\t\\t\\t\\t\\t\\t yet he opened not his mouth;",
          "\\t\\t\\t\\t like a lamb that is led to the slaughter,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and like a sheep that before its shearers is silent,",
          "\\t\\t\\t\\t\\t\\t\\t\\t so he opened not his mouth.",
        ],
        [
          "[8] By oppression and judgment he was taken away;",
          "\\t\\t\\t\\t\\t\\t\\t\\t and as for his generation, who considered",
          "\\t\\t\\t\\t that he was cut off out of the land of the living,",
          "\\t\\t\\t\\t\\t\\t\\t\\t stricken for the transgression of my people?",
        ],
        [
          "[9] And they made his grave with the wicked",
          "\\t\\t\\t\\t\\t\\t\\t\\t and with a rich man in his death,",
          "\\t\\t\\t\\t although he had done no violence,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and there was no deceit in his mouth.",
        ],
        [
          "[10] Yet it was the will of the LORD to crush him;",
          "\\t\\t\\t\\t\\t\\t\\t\\t he has put him to grief;",
          "\\t\\t\\t\\t when his soul makes an offering for guilt,",
          "\\t\\t\\t\\t\\t\\t\\t\\t he shall see his offspring; he shall prolong his days;",
          "\\t\\t\\t\\t the will of the LORD shall prosper in his hand.",
        ],
        [
          "[11] Out of the anguish of his soul he shall see and be satisfied;",
          "\\t\\t\\t\\t by his knowledge shall the righteous one, my servant,",
          "\\t\\t\\t\\t\\t\\t\\t\\t make many to be accounted righteous,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and he shall bear their iniquities.",
        ],
        [
          "[12] Therefore I will divide him a portion with the many,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and he shall divide the spoil with the strong,",
          "\\t\\t\\t\\t because he poured out his soul to death",
          "\\t\\t\\t\\t\\t\\t\\t\\t and was numbered with the transgressors;",
        ],
        [
          "\\t\\t\\t\\t yet he bore the sin of many,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and makes intercession for the transgressors.",
          """,
        ],
      ]
    `);
  });
  it('splits long verses evenly across slides', () => {
    const verses = parsePassage(JOHN2_13_14);
    const { richTextData } = processAndRenderVerses(
      verses,
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
          "[13] I am writing to you, fathers,",
          "\\t\\t\\t\\t\\t\\t\\t\\t because you know him who is from the beginning.",
          "\\t\\t\\t\\t I am writing to you, young men,",
        ],
        [
          "\\t\\t\\t\\t\\t\\t\\t\\t because you have overcome the evil one.",
          "\\t\\t\\t\\t I write to you, children,",
          "\\t\\t\\t\\t\\t\\t\\t\\t because you know the Father.",
        ],
        [
          "[14] I write to you, fathers,",
          "\\t\\t\\t\\t\\t\\t\\t\\t because you know him who is from the beginning.",
          "\\t\\t\\t\\t I write to you, young men,",
          "\\t\\t\\t\\t\\t\\t\\t\\t because you are strong,",
        ],
        [
          "\\t\\t\\t\\t\\t\\t\\t\\t and the word of God abides in you,",
          "\\t\\t\\t\\t\\t\\t\\t\\t and you have overcome the evil one.",
          """,
        ],
      ]
    `);
  });
});
