// verse_chunking.ts

import { FormattedChunkType, FormattedLine, Verse } from './types';

export function processAndRenderVerses(
  verses: Verse[],
  boxWidth: number,
  boxHeight: number,
  fontName: string,
  fontSize: number,
  lineHeightMult: number
): { canvases: HTMLCanvasElement[]; richTextData: FormattedChunkType[] } {
  const canvases: HTMLCanvasElement[] = [];
  const richTextData: FormattedChunkType[] = [];
  const lineHeight = fontSize * lineHeightMult;

  const measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) {return { canvases: [], richTextData: [] };}

  let currentChunkLines: FormattedLine[] = [];
  let currentLine: FormattedLine = [];
  let currentX = 0;
  let currentY = fontSize;

  const finishChunk = () => {
    if (currentChunkLines.length === 0) {return;}

    const canvas = document.createElement('canvas');
    canvas.width = boxWidth;
    canvas.height = boxHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {return;}

    // 2. Set the text color to black for better contrast.
    ctx.fillStyle = 'black';
    // **** CHANGED SECTION END ****

    let renderY = fontSize;
    for (const line of currentChunkLines) {
      let renderX = 0;

      if (line.length > 0 && /^\s+$/.test(line[0].text)) {
        ctx.font = `${fontSize}px ${fontName}`;
        renderX = ctx.measureText(line[0].text).width;
      }

      for (const word of line) {
        if (/^\s+$/.test(word.text)) {continue;}

        ctx.font = `${word.isBold ? 'bold ' : ''}${fontSize}px ${fontName}`;
        const textToRender = word.isBold ? word.text : `${word.text.trim()} `;
        ctx.fillText(textToRender, renderX, renderY);
        renderX += ctx.measureText(textToRender).width;
      }
      renderY += lineHeight;
    }

    canvases.push(canvas);
    richTextData.push({
      formattedText: currentChunkLines,
      fontName,
      fontSize,
      lineHeightMult,
      boxWidth,
      boxHeight,
    });
    currentChunkLines = [];
  };

  const startNewLine = () => {
    if (currentLine.length > 0) {currentChunkLines.push(currentLine);}
    currentLine = [];
    currentX = 0;
    currentY += lineHeight;

    if (currentY > boxHeight) {
      finishChunk();
      currentY = fontSize;
    }
  };

  // The rest of the function (main loop) remains the same.
  for (const verse of verses) {
    measureCtx.font = `bold ${fontSize}px ${fontName}`;
    const verseNumText = `${verse.verseNumber} `;
    const verseNumWidth = measureCtx.measureText(verseNumText).width;

    if (currentX > 0 && currentX + verseNumWidth > boxWidth) {startNewLine();}
    currentLine.push({ text: verseNumText, isBold: true });
    currentX += verseNumWidth;

    const poeticLines = verse.text.split('\n');
    measureCtx.font = `${fontSize}px ${fontName}`;

    const firstLineWords = poeticLines[0].trim().split(/ +/);
    for (const word of firstLineWords) {
      if (!word) {continue;}
      const wordWithSpace = `${word} `;
      const wordWidth = measureCtx.measureText(wordWithSpace).width;
      if (currentX + wordWidth > boxWidth) {startNewLine();}
      currentLine.push({ text: word, isBold: false });
      currentX += wordWidth;
    }

    for (let i = 1; i < poeticLines.length; i++) {
      const poeticLine = poeticLines[i];
      startNewLine();

      const indentMatch = poeticLine.match(/^(\s*)/);
      const indentText = indentMatch ? indentMatch[1] : '';
      const trimmedLine = poeticLine.trim();

      if (indentText) {
        currentX = measureCtx.measureText(indentText).width;
        if (currentLine.length === 0) {currentLine.push({ text: indentText, isBold: false });}
      }

      if (!trimmedLine) {continue;}

      const words = trimmedLine.split(/ +/);
      for (const word of words) {
        if (!word) {continue;}
        const wordWithSpace = `${word} `;
        const wordWidth = measureCtx.measureText(wordWithSpace).width;
        if (currentX + wordWidth > boxWidth) {
          startNewLine();
        }
        currentLine.push({ text: word, isBold: false });
        currentX += wordWidth;
      }
    }
  }

  if (currentLine.length > 0) {currentChunkLines.push(currentLine);}
  if (currentChunkLines.length > 0) {finishChunk();}

  return { canvases, richTextData };
}

/**
 * Converts a FormattedLine into clean HTML. It handles bolding but now
 * intentionally ignores indentation to allow for manual tabbing in Canva.
 */
function formatHtmlLine(line: FormattedLine): string {
  const contentParts: string[] = [];

  for (const word of line) {
    // Skip any word that is purely whitespace (our old indent placeholders)
    if (/^\s+$/.test(word.text) && !word.text.trim()) {
      continue;
    }

    const text = word.text.trim();
    if (text) {
      // Only process words that have actual content
      if (word.isBold) {
        contentParts.push(`<strong>${text}</strong>`);
      } else {
        contentParts.push(text);
      }
    }
  }

  return contentParts.join(' ');
}

/**
 * Generates a single, simplified HTML string for all chunks, optimized for Canva.
 */
export const generateRichTextHTML = (chunks: FormattedChunkType[]): string => {
  if (chunks.length === 0) {return '';}

  return chunks
    .map((chunk, index) => {
      // Create a plain text header with line breaks for spacing
      const header = `Slide ${index + 1}<br><br>`;
      const slideContent = chunk.formattedText.map(formatHtmlLine).join('<br>');
      return header + slideContent;
    })
    .join('<br><br><br>'); // Join separate chunks with extra spacing
};
