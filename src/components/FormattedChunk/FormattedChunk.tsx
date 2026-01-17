import React, { useEffect, useRef } from 'react';
import { Button, Card, Center, Group } from '@mantine/core';
import { FormattedChunkType } from '@/data/types';

/**
 * Generates HTML for a single chunk's formatted text
 */
function formatHtmlLine(line: { text: string; isBold: boolean }[]): string {
  const contentParts: string[] = [];

  for (const word of line) {
    if (/^\s+$/.test(word.text) && !word.text.trim()) {
      continue;
    }

    const text = word.text.trim();
    if (text) {
      if (word.isBold) {
        contentParts.push(`<strong>${text}</strong>`);
      } else {
        contentParts.push(text);
      }
    }
  }

  return contentParts.join(' ');
}

function generateChunkHtml(chunk: FormattedChunkType): string {
  return chunk.formattedText.map(formatHtmlLine).join('<br>');
}

export interface FormattedChunkProps {
  canvas: HTMLCanvasElement;
  downloadName?: string;
  richTextChunk?: FormattedChunkType;
}

export const FormattedChunk: React.FC<FormattedChunkProps> = ({
  canvas,
  downloadName,
  richTextChunk,
}) => {
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
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(canvas);
    }
  }, [canvas]);

  const copyImage = () => {
    if (!supportsImageClipboard) {
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas');
        return;
      }
      navigator.clipboard
        .write([new ClipboardItem({ 'image/png': blob })])
        .catch((err) => console.error('Failed to copy image:', err));
    });
  };

  const copyRichText = () => {
    if (!richTextChunk) {
      return;
    }
    const html = generateChunkHtml(richTextChunk);
    const blob = new Blob([html], { type: 'text/html' });
    navigator.clipboard
      .write([new ClipboardItem({ 'text/html': blob })])
      .catch((err) => console.error('Failed to copy rich text:', err));
  };

  const downloadImage = () => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas');
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
    <Card shadow="sm" padding="lg" radius="md" withBorder bg="white">
      <div ref={containerRef} />
      <Center mt="md">
        <Group>
          {supportsImageClipboard && <Button onClick={copyImage}>Copy Image</Button>}
          {richTextChunk && (
            <Button variant="outline" onClick={copyRichText}>
              Copy Rich Text
            </Button>
          )}
          <Button variant="light" onClick={downloadImage}>
            Download Image
          </Button>
        </Group>
      </Center>
    </Card>
  );
};
