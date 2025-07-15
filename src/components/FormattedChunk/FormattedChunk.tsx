import React, { useRef, useEffect } from 'react';
import { Card, Center, Button, Group } from '@mantine/core';

export interface FormattedChunkProps {
  canvas: HTMLCanvasElement;
}

export const FormattedChunk: React.FC<FormattedChunkProps> = ({ canvas }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      // Clear previous canvas and append the new one
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(canvas);
    }
  }, [canvas]);

  const copyImage = () => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        return;
      }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .catch(err => console.error("Failed to copy image:", err));
    });
  };

  return (
    // Added bg="white" to make the entire card's background white.
    <Card shadow="sm" padding="lg" radius="md" withBorder bg="white">
      {/*
        The "gap" is created by the `padding="lg"` property above.
        This adds space inside the card. You could set it to padding={0}
        to remove the gap entirely.
      */}
      <div ref={containerRef} />
      <Center mt="md">
        <Group>
          <Button onClick={copyImage}>Copy Image</Button>
        </Group>
      </Center>
    </Card>
  );
};