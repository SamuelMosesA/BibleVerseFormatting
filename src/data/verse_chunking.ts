import { FormattedChunkType, FormattedLine, FormattedVerse, Verse } from "./types";

function tryChunkVerse(
  ctx: CanvasRenderingContext2D,
  verse: Verse,
  boxWidth: number,
  boxHeight: number,
  fontSize: number,
  lineHeightMult: number,
  fontName: string,
  startX: number,
  startY: number
): FormattedVerse | null {

  // We assume a line-height factor for spacing betwen lines
  const lineHeight = fontSize * lineHeightMult;
  // Create a bold prefix for the verse number.
  // For measuring, set the context to the bold font.
  ctx.font = `bold ${fontSize}px ${fontName}`;
  // Measure the verse number and the trailing space.
  let verseWithSpace = verse.verseNumber + ' ';
  const boldWidth = ctx.measureText(verseWithSpace).width;

  let lineWidth = startX;
  let currentChunkHeight = startY;

  let currentChunkLines: FormattedLine[] = []

  let line: FormattedLine = []
  // Now process the verse text by splitting it into words.
  let verseText = verse.text.replaceAll("\n", " \n ").replaceAll("\t", " \t ")
  const words = verseText.split(/ +/);
  // For measurement purposes, we will accumulate the pixel width.
  lineWidth += boldWidth;
  line.push({ text: verse.verseNumber + " ", isBold: true })
  // Switch to the normal font for subsequent words.
  ctx.font = `${fontSize}px ${fontName}`;
  console.log(ctx.font)

  // Process each word (plus a trailing space).
  for (const word of words) {
    let trimmedWord = word.replace(/^( +)|( +)$/g, '');
    if(trimmedWord == "\t"){
      trimmedWord = " "
    }
    const wordWithSpace = trimmedWord + ' ';
    const wordWidth = ctx.measureText(wordWithSpace).width;
    if ((lineWidth + wordWidth > boxWidth) || trimmedWord == "\n") {
      // The current word would overflow the line, so push the line.
      // Before adding the line, check if there’s room in the current chunk.
      if (currentChunkHeight + lineHeight > boxHeight && trimmedWord != "\n") {
        // Not enough room—save the current chunk and start a new one.
        return null;
      }
      currentChunkLines.push(line);
      currentChunkHeight += lineHeight;
      // Start a new line without the verse number (only for continuation lines).
      if (trimmedWord == "\n") {
        line = []
        lineWidth = 0
      } {
        line = [{ text: wordWithSpace, isBold: false }]
        lineWidth = ctx.measureText(wordWithSpace).width;
      }
    } else {
      // Otherwise, append the word.
      line.push({ text: trimmedWord, isBold: false });
      lineWidth += wordWidth;
    }
  }

  // Push the final line for the current verse.
  if (currentChunkHeight > boxHeight) {
    if (line.length > 0) {
      return null
    } else {
      return {
        format: currentChunkLines,
        endX: lineWidth,
        endY: currentChunkHeight - lineHeight
      }
    }
  }
  currentChunkLines.push(line)
  return {
    format: currentChunkLines,
    endX: lineWidth,
    endY: currentChunkHeight
  }

}


function removeTrailingNewline(chunk: FormattedChunkType){
  let lastLine = chunk[chunk.length-1]
  if(lastLine[lastLine.length-1].text.search("\n") > 0){
    console.log(lastLine[lastLine.length -1 ])
  }
}

/**
 * Given a set of verses and canvas parameters, returns a list of HTML-formatted strings.
 * Each string is a “chunk” that will fit into a canvas of boxWidth x boxHeight.
 *
 * @param verses - an object with keys as verse numbers and values as verse text.
 * @param boxWidth - the width of the canvas (in pixels).
 * @param boxHeight - the height of the canvas (in pixels).
 * @param fontSize - the font size (in pixels).
 * @param fontName - the font family name (must match the one loaded from your google font url).
 * @returns An array of strings where each string is HTML with <b> for the verse number and <br> between lines.
 */
export default function chunkVerses(
  verses: Verse[],
  boxWidth: number,
  boxHeight: number,
  fontSize: number,
  fontName: string,
  lineHeightMult: number
): FormattedChunkType[] {
  // Create an offscreen canvas for measuring text widths.
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const lineHeight = fontSize * lineHeightMult;
  let xPostiton = 0
  let currentChunkHeight = lineHeight

  const chunks: FormattedChunkType[] = [];

  let currentChunk: FormattedLine[] = []

  let index = 0
  while(index< verses.length){
    let verse = verses.at(index)
    if (verse == undefined) break;
    let formattedVerseLine = tryChunkVerse(ctx, verse, boxWidth, boxHeight, fontSize, lineHeightMult, fontName, xPostiton, currentChunkHeight);
    if (xPostiton == 0 && currentChunkHeight == lineHeight && formattedVerseLine == null){
      throw {"verse too large": verse}
    }
    if (formattedVerseLine == null || formattedVerseLine.format.length == 0) {
      chunks.push(currentChunk)
      currentChunk = []
      xPostiton = 0
      currentChunkHeight = lineHeight
    } else {
      let linesToAdd = formattedVerseLine.format
      if (currentChunk.length > 0){
        currentChunk[currentChunk.length - 1] = currentChunk[currentChunk.length - 1].concat(linesToAdd[0])
        linesToAdd = linesToAdd.slice(1)
      }
      currentChunk = currentChunk.concat(linesToAdd)
      xPostiton = formattedVerseLine.endX
      currentChunkHeight = formattedVerseLine.endY
      index += 1
    }
  }

  chunks.push(currentChunk)
  console.log(chunks)
  return chunks;
}


function formatHtmlLine(line: FormattedLine):string{
      return `${line
              .map((word) =>
                word.isBold ? `<b>${word.text.trim()}</b>` : word.text
              )
              .join(" ")}`
    }

export const generateHTML = (
  chunk: FormattedChunkType,
  fontSize: string = "16px",
  fontFamily: string = "Arial, sans-serif"
): string => {
  let str = `
    <div style="font-size: ${fontSize}; font-family: ${fontFamily};">
      ${chunk.slice(0,-1)
        .map((line) =>{ return formatHtmlLine(line) + "<br>" })
        .join("")}${formatHtmlLine(chunk[chunk.length-1])}</div>
  `;
  console.log(str)
  return str
};

