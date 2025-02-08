/**
 * Given a set of verses and canvas parameters, returns a list of HTML-formatted strings.
 * Each string is a “chunk” that will fit into a canvas of boxWidth x boxHeight.
 *
 * @param verses - an object with keys as verse numbers and values as verse text.
 * @param boxWidth - the width of the canvas (in pixels).
 * @param boxHeight - the height of the canvas (in pixels).
 * @param fontSize - the font size (in pixels).
 * @param fontFamily - the font family name (must match the one loaded from your google font url).
 * @returns An array of strings where each string is HTML with <b> for the verse number and <br> between lines.
 */
function chunkVerses(
    verses: { [verseNumber: string]: string },
    boxWidth: number,
    boxHeight: number,
    fontSize: number,
    fontFamily: string
  ): string[] {
    // Create an offscreen canvas for measuring text widths.
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
  
    // We assume a line-height factor (here, 1.2) for spacing between lines.
    const lineHeight = fontSize * 1.2;
  
    const chunks: string[] = [];
    let currentChunkLines: string[] = [];
    let currentChunkHeight = 0;
  
    // It’s usually best to process verses in order. If the keys are numeric strings, sort them:
    const verseEntries = Object.entries(verses).sort((a, b) => Number(a[0]) - Number(b[0]));
  
    for (const [verseNumber, verseText] of verseEntries) {
      // Create a bold prefix for the verse number.
      const boldPrefixHTML = `<b>${verseNumber}</b> `;
      // For measuring, set the context to the bold font.
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      // Measure the verse number and the trailing space.
      const boldWidth = ctx.measureText(verseNumber).width + ctx.measureText(' ').width;
  
      // Now process the verse text by splitting it into words.
      const words = verseText.split(' ');
      let line = boldPrefixHTML; // start the first line with the bold verse number.
      // For measurement purposes, we will accumulate the pixel width.
      let lineWidth = boldWidth;
  
      // Switch to the normal font for subsequent words.
      ctx.font = `${fontSize}px ${fontFamily}`;
  
      // Process each word (plus a trailing space).
      for (const word of words) {
        const wordWithSpace = word + ' ';
        const wordWidth = ctx.measureText(wordWithSpace).width;
        if (lineWidth + wordWidth > boxWidth) {
          // The current word would overflow the line, so push the line.
          // Before adding the line, check if there’s room in the current chunk.
          if (currentChunkHeight + lineHeight > boxHeight) {
            // Not enough room—save the current chunk and start a new one.
            chunks.push(currentChunkLines.join('<br>'));
            currentChunkLines = [];
            currentChunkHeight = 0;
          }
          currentChunkLines.push(line.trim());
          currentChunkHeight += lineHeight;
  
          // Start a new line without the verse number (only for continuation lines).
          line = wordWithSpace;
          lineWidth = ctx.measureText(wordWithSpace).width;
        } else {
          // Otherwise, append the word.
          line += wordWithSpace;
          lineWidth += wordWidth;
        }
      }
  
      // Push the final line for the current verse.
      if (line.trim().length > 0) {
        if (currentChunkHeight + lineHeight > boxHeight) {
          chunks.push(currentChunkLines.join('<br>'));
          currentChunkLines = [];
          currentChunkHeight = 0;
        }
        currentChunkLines.push(line.trim());
        currentChunkHeight += lineHeight;
      }
  
      // Optionally, add an empty line between verses.
      if (currentChunkHeight + lineHeight > boxHeight) {
        chunks.push(currentChunkLines.join('<br>'));
        currentChunkLines = [];
        currentChunkHeight = 0;
      } else {
        currentChunkLines.push(''); // empty line for spacing
        currentChunkHeight += lineHeight;
      }
    }
  
    // If anything remains, push it as the last chunk.
    if (currentChunkLines.length > 0) {
      chunks.push(currentChunkLines.join('<br>'));
    }
  
    return chunks;
  }
  