// verse_chunking.ts

import { FormattedChunkType, FormattedLine, Verse } from './types';

interface RenderOptions {
  includeLogo?: boolean;
  logoImage?: HTMLImageElement | null;
  totalHeight?: number;
}

interface LogoLayout {
  textStartX: number;
  textWidth: number;
  drawRect: { x: number; y: number; width: number; height: number } | null;
}

function getLogoLayout(
  logoImage: HTMLImageElement | null,
  boxWidth: number,
  boxHeight: number
): LogoLayout {
  if (!logoImage) {
    return { textStartX: 0, textWidth: boxWidth, drawRect: null };
  }

  const logoMarginX = Math.max(24, Math.round(boxWidth * 0.02));
  const logoGap = Math.max(16, Math.round(boxWidth * 0.015));
  const logoMaxWidth = Math.round(boxWidth * 0.18);
  const logoMaxHeight = Math.round(boxHeight * 0.88);

  const widthScale = logoMaxWidth / logoImage.width;
  const heightScale = logoMaxHeight / logoImage.height;
  const scale = Math.min(widthScale, heightScale, 1);
  const drawWidth = Math.round(logoImage.width * scale);
  const drawHeight = Math.round(logoImage.height * scale);
  const drawX = logoMarginX;
  const drawY = Math.round((boxHeight - drawHeight) / 2);

  return {
    textStartX: drawX + drawWidth + logoGap,
    textWidth: Math.max(0, boxWidth - (drawX + drawWidth + logoGap)),
    drawRect: { x: drawX, y: drawY, width: drawWidth, height: drawHeight },
  };
}

function getRenderedLineWidth(
  ctx: CanvasRenderingContext2D,
  line: FormattedLine,
  fontName: string,
  fontSize: number
): number {
  let width = 0;
  for (const word of line) {
    if (/^\s+$/.test(word.text)) {
      ctx.font = `${fontSize}px ${fontName}`;
      width += ctx.measureText(word.text).width;
      continue;
    }
    ctx.font = `${word.isBold ? 'bold ' : ''}${fontSize}px ${fontName}`;
    const textToRender = word.isBold ? word.text : `${word.text.trim()} `;
    width += ctx.measureText(textToRender).width;
  }
  return width;
}

function appendVerseLines(
  verse: Verse,
  measureCtx: CanvasRenderingContext2D,
  textWidth: number,
  fontName: string,
  fontSize: number,
  startLine: FormattedLine,
  startX: number
): { lines: FormattedLine[]; endLine: FormattedLine; endX: number } {
  const lines: FormattedLine[] = [];
  let currentLine: FormattedLine = startLine.slice();
  let currentX = startX;

  const pushLine = () => {
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    currentLine = [];
    currentX = 0;
  };

  const addWord = (word: { text: string; isBold: boolean }) => {
    if (/^\s+$/.test(word.text)) {
      measureCtx.font = `${fontSize}px ${fontName}`;
      const width = measureCtx.measureText(word.text).width;
      if (currentX + width > textWidth && currentLine.length > 0) {
        pushLine();
      }
      currentLine.push(word);
      currentX += width;
      return;
    }

    measureCtx.font = `${word.isBold ? 'bold ' : ''}${fontSize}px ${fontName}`;
    const textToRender = word.isBold ? word.text : `${word.text.trim()} `;
    const width = measureCtx.measureText(textToRender).width;
    if (currentX + width > textWidth && currentLine.length > 0) {
      pushLine();
    }
    currentLine.push(word);
    currentX += width;
  };

  addWord({ text: `${verse.verseNumber} `, isBold: true });

  const cleanedText = verse.text.replace(/\n+$/g, '');
  if (!cleanedText.trim()) {
    return { lines, endLine: currentLine, endX: currentX };
  }

  const poeticLines = cleanedText.split('\n');
  const firstLineWords = poeticLines[0].trim().split(/ +/);
  for (const word of firstLineWords) {
    if (!word) {
      continue;
    }
    addWord({ text: word, isBold: false });
  }

  for (let i = 1; i < poeticLines.length; i++) {
    const poeticLine = poeticLines[i];
    const indentMatch = poeticLine.match(/^(\s*)/);
    const indentText = indentMatch ? indentMatch[1] : '';
    const trimmedLine = poeticLine.trim();

    // Skip lines that have no actual text content (just whitespace)
    if (!trimmedLine) {
      continue;
    }
    pushLine();

    if (indentText) {
      addWord({ text: indentText, isBold: false });
    }

    const words = trimmedLine.split(/ +/);
    for (const word of words) {
      if (!word) {
        continue;
      }
      addWord({ text: word, isBold: false });
    }
  }

  return { lines, endLine: currentLine, endX: currentX };
}

export function processAndRenderVerses(
  verses: Verse[],
  boxWidth: number,
  boxHeight: number,
  fontName: string,
  fontSize: number,
  lineHeightMult: number,
  options?: RenderOptions
): { canvases: HTMLCanvasElement[]; richTextData: FormattedChunkType[] } {
  const canvases: HTMLCanvasElement[] = [];
  const richTextData: FormattedChunkType[] = [];
  const lineHeight = fontSize * lineHeightMult;

  const measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) {
    return { canvases: [], richTextData: [] };
  }

  const maxLinesPerChunk = Math.floor((boxHeight - fontSize) / lineHeight) + 1;
  if (maxLinesPerChunk < 1) {
    return { canvases: [], richTextData: [] };
  }

  const logoLayout = getLogoLayout(
    options?.includeLogo ? (options.logoImage ?? null) : null,
    boxWidth,
    boxHeight
  );

  let currentChunkLines: FormattedLine[] = [];
  let currentLine: FormattedLine = [];
  let currentX = 0;

  const flushCurrentLine = () => {
    if (currentLine.length > 0) {
      currentChunkLines.push(currentLine);
      currentLine = [];
      currentX = 0;
    }
  };

  const finishChunk = () => {
    if (currentChunkLines.length === 0) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = boxWidth;
    canvas.height = options?.totalHeight ?? boxHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Fill entire canvas with black (for projection)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fill the white box at the top
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, boxWidth, boxHeight);
    ctx.fillStyle = 'black';

    if (logoLayout.drawRect && options?.includeLogo && options.logoImage) {
      const { x, y, width, height } = logoLayout.drawRect;
      ctx.drawImage(options.logoImage, x, y, width, height);
    }

    const minTopPadding = 16;
    const textBlockHeight = currentChunkLines.length * lineHeight;
    const topPadding = Math.max(minTopPadding, Math.round((boxHeight - textBlockHeight) / 2));
    let renderY = topPadding + fontSize;
    for (const line of currentChunkLines) {
      const lineWidth = getRenderedLineWidth(ctx, line, fontName, fontSize);
      let renderX = logoLayout.textStartX + Math.max(0, (logoLayout.textWidth - lineWidth) / 2);

      for (const word of line) {
        if (/^\s+$/.test(word.text)) {
          ctx.font = `${fontSize}px ${fontName}`;
          renderX += ctx.measureText(word.text).width;
          continue;
        }

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
      totalHeight: options?.totalHeight ?? boxHeight,
    });
    currentChunkLines = [];
  };

  for (const verse of verses) {
    const layout = appendVerseLines(
      verse,
      measureCtx,
      logoLayout.textWidth,
      fontName,
      fontSize,
      currentLine,
      currentX
    );
    const linesAfter =
      currentChunkLines.length + layout.lines.length + (layout.endLine.length > 0 ? 1 : 0);

    if (linesAfter <= maxLinesPerChunk) {
      currentChunkLines = currentChunkLines.concat(layout.lines);
      currentLine = layout.endLine;
      currentX = layout.endX;
      continue;
    }

    const freshLayout = appendVerseLines(
      verse,
      measureCtx,
      logoLayout.textWidth,
      fontName,
      fontSize,
      [],
      0
    );
    const freshLinesTotal = freshLayout.lines.length + (freshLayout.endLine.length > 0 ? 1 : 0);

    if (freshLinesTotal <= maxLinesPerChunk) {
      flushCurrentLine();
      finishChunk();
      currentChunkLines = freshLayout.lines.slice();
      currentLine = freshLayout.endLine;
      currentX = freshLayout.endX;
      continue;
    }

    flushCurrentLine();
    finishChunk();

    const verseLines = freshLayout.lines.concat(
      freshLayout.endLine.length > 0 ? [freshLayout.endLine] : []
    );
    const totalLines = verseLines.length;
    const numChunks = Math.ceil(totalLines / maxLinesPerChunk);
    const balancedSize = Math.ceil(totalLines / numChunks);

    for (let i = 0; i < totalLines; i += balancedSize) {
      currentChunkLines = verseLines.slice(i, i + balancedSize);
      finishChunk();
    }
    currentChunkLines = [];
    currentLine = [];
    currentX = 0;
  }

  flushCurrentLine();
  if (currentChunkLines.length > 0) {
    finishChunk();
  }

  return { canvases, richTextData };
}

export function renderHeadingCanvas(
  headingText: string,
  boxWidth: number,
  boxHeight: number,
  fontName: string,
  fontSize: number,
  options?: RenderOptions
): HTMLCanvasElement | null {
  if (!headingText.trim()) {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = boxWidth;
  canvas.height = options?.totalHeight ?? boxHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  // Fill entire canvas with black (for projection)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fill the white box at the top
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, boxWidth, boxHeight);
  ctx.fillStyle = 'black';

  const headingFontSize = Math.round(fontSize * 1.6);
  const lineHeight = headingFontSize * 1.2;
  const logoLayout = getLogoLayout(
    options?.includeLogo ? (options.logoImage ?? null) : null,
    boxWidth,
    boxHeight
  );
  const maxTextWidth = Math.round(logoLayout.textWidth * 0.9);

  ctx.font = `bold ${headingFontSize}px ${fontName}`;

  const words = headingText.trim().split(/ +/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxTextWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const minTopPadding = 16;
  const totalHeight = lines.length * lineHeight;
  const topPadding = Math.max(minTopPadding, Math.round((boxHeight - totalHeight) / 2));
  let y = topPadding + headingFontSize;

  if (logoLayout.drawRect && options?.includeLogo && options.logoImage) {
    const { x, y: logoY, width, height } = logoLayout.drawRect;
    ctx.drawImage(options.logoImage, x, logoY, width, height);
  }

  for (const line of lines) {
    const lineWidth = ctx.measureText(line).width;
    const x = Math.round(logoLayout.textStartX + (logoLayout.textWidth - lineWidth) / 2);
    ctx.fillText(line, x, y);
    y += lineHeight;
  }

  return canvas;
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
  if (chunks.length === 0) {
    return '';
  }

  return chunks
    .map((chunk, index) => {
      // Create a plain text header with line breaks for spacing
      const header = `Slide ${index + 1}<br><br>`;
      const slideContent = chunk.formattedText.map(formatHtmlLine).join('<br>');
      return header + slideContent;
    })
    .join('<br><br><br>'); // Join separate chunks with extra spacing
};
