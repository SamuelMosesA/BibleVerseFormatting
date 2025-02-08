import React, { useRef, useEffect, useState } from 'react';
import { Card, Container, Center, Group, CopyButton, Checkbox, Button, Text } from '@mantine/core';

export interface FormattedChunkProps {
  formattedText: string;
  boxWidth: string;   // e.g., "500"
  boxHeight: string;  // e.g., "300"
  fontName: string;
  fontSize: string;   // e.g., "20"
}

/**
 * Renders the formatted text onto a canvas.
 * The formattedText should include <b> tags for bold segments and <br> for line breaks.
 */
export const FormattedChunk: React.FC<FormattedChunkProps> = ({
  formattedText,
  boxWidth,
  boxHeight,
  fontName,
  fontSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    const width = Number(boxWidth);
    const height = Number(boxHeight);
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
        
    ctx.globalCompositeOperation = 'darken'
    ctx.fillStyle = "#fffdaf";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Set the fill style explicitly.
    ctx.fillStyle = "#000";

    // Ensure the font is loaded. Here we assume the Google font is loaded
    // and available as 'CustomFont'. You can change this as needed.
    const fontFamily = fontName; // Change to match your font-family
    const fontSizePx = Number(fontSize);
    const lineHeight = fontSizePx * 1.2;

    // Clear the canvas

    // Start y at fontSizePx to avoid clipping the top of the text.
    let y = fontSizePx;

    // Split the formatted text into lines (using <br> as a delimiter).
    const lines = formattedText.split('<br>');

    for (const line of lines) {
      let x = 0;
      if (line.includes('<b>')) {
        // Extract bold and normal text (assuming bold at the beginning).
        const boldMatch = line.match(/^<b>(.*?)<\/b>\s*(.*)$/);
        if (boldMatch) {
          const boldText = boldMatch[1];
          const normalText = boldMatch[2];

          // Draw bold text.
          ctx.font = `bold ${fontSizePx}px ${fontFamily}`;
          ctx.fillText(boldText, x, y);
          const boldWidth = ctx.measureText(boldText).width;
          x += boldWidth;

          // Add a space after the bold text.
          const spaceWidth = ctx.measureText(' ').width;
          x += spaceWidth;

          // Draw normal text.
          ctx.font = `${fontSizePx}px ${fontFamily}`;
          ctx.fillText(normalText, x, y);
        } else {
          // Fallback: draw the entire line normally.
          ctx.font = `${fontSizePx}px ${fontFamily}`;
          ctx.fillText(line, x, y);
        }
      } else {
        // No bold formatting, draw normally.
        ctx.font = `${fontSizePx}px ${fontFamily}`;
        ctx.fillText(line, x, y);
      }
      y += lineHeight;
      if (y + lineHeight > height) break;
    }
  }, [formattedText, boxWidth, boxHeight, fontName, fontSize]);


  const copyRichText = (htmlString: string) => {
    const blob = new Blob([htmlString], { type: "text/html" });
    const data = [new ClipboardItem({ "text/html": blob })];

    navigator.clipboard.write(data).then(() => {
      console.log("HTML copied as rich text!");
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  };
    const [isChecked, setIsChecked] = useState(false);
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
      <Card.Section p="1dv">
        {/* Canvas element with a border for visual debugging */}
        <canvas ref={canvasRef} style={{ border: '1px solid #000' }} />
        <Container p="1dvw">
          <Center>
            <Group>
              <CopyButton value={formattedText}>
                {({ copied, copy }) => (
                  <Button color={copied ? 'teal' : 'blue'} onClick={() =>copyRichText(formattedText)}>
                    {copied ? 'Copied verses' : 'Copy verses'}
                  </Button>
                )}
              </CopyButton>
              <Checkbox label="Pasted" size="md" 
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              styles={{
                input: {
                  backgroundColor: isChecked ? "transparent" : "#1DB954", // Fill when unchecked
                  borderColor: isChecked ? "#1DB954" : "transparent", // Border when checked
                },
                label: { color: isChecked ? "#1DB954" : "white" }, // Change text color accordingly
              }}
              />
            </Group>
          </Center>
        </Container>
      </Card.Section>
    </Card>
  );
};
