import React, { useRef, useEffect } from 'react';
import { Card, Center, Button, Group } from '@mantine/core';

export interface FormattedChunkProps {
  canvas: HTMLCanvasElement;
  downloadName?: string;
}

export const FormattedChunk: React.FC<FormattedChunkProps> = ({ canvas, downloadName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const supportsImageClipboard =
    !isSafari &&
    typeof ClipboardItem !== 'undefined' &&
    !!navigator.clipboard?.write &&
    !!window.isSecureContext;

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
    if (!supportsImageClipboard) {return;}
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        return;
      }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .catch(err => console.error("Failed to copy image:", err));
    });
  };

  const downloadImage = () => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName || 'bible-verse.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
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
          {supportsImageClipboard && (
            <Button onClick={copyImage}>
              Copy Image
            </Button>
          )}
          <Button variant="light" onClick={downloadImage}>Download Image</Button>
        </Group>
      </Center>
    </Card>
  );
};
