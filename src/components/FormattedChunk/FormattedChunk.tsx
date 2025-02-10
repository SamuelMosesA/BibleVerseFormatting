import React, { useRef, useEffect, useState } from 'react';
import { Card, Container, Center, Group, CopyButton, Checkbox, Button, Text } from '@mantine/core';
import { FormattedChunkType, generateHTML} from '@/data/verse_chunking';

export interface FormattedChunkProps {
  formattedText: FormattedChunkType;
  boxWidth: string;   // e.g., "500"
  boxHeight: string;  // e.g., "300"
  fontName: string;
  fontSize: string;   // e.g., "20"
  lineHeightMult: string
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
  lineHeightMult
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
    const lineHeight = fontSizePx * Number(lineHeightMult);

    // Clear the canvas

    // Start y at fontSizePx to avoid clipping the top of the text.
    let y = fontSizePx;

    // Split the formatted text into lines (using <br> as a delimiter).
    const lines = formattedText;

    for (const line of lines) {
      let x = 0;
      for (const word of line){
        // Extract bold and normal text (assuming bold at the beginning).
        if (word.isBold) {
          const boldText = word.text + " "
          // Draw bold text.
          ctx.font = `bold ${fontSizePx}px ${fontFamily}`;
          ctx.fillText(boldText, x, y);
          x += ctx.measureText(boldText).width;
        } else {
          // Fallback: draw the entire line normally.
          ctx.font = `${fontSizePx}px ${fontFamily}`;
          const normalText = word.text + " "
          ctx.fillText(normalText, x, y);
          x += ctx.measureText(normalText).width;
        }
      }
      y += lineHeight;
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
              <CopyButton value='htmlBlob'>
                {({ copied, copy }) => (
                  <Button color={copied ? 'teal' : 'blue'} onClick={() =>copyRichText(generateHTML(formattedText, fontSize + " px", fontName))}>
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
