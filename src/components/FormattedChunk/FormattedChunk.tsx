import React from "react";
import { Card, Text, Container, Center, Group, Button, Checkbox, CopyButton } from "@mantine/core";

// Define props for FormattedChunk
export interface FormattedChunkProps {
  formattedText: string;
}

export const FormattedChunk: React.FC<FormattedChunkProps> = ({ formattedText }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
      <Card.Section>
        <Text>{formattedText}</Text>
        <Container p="1dvw">
          <Center>
            <Group>
              <CopyButton value={formattedText}>
                {({ copied, copy }) => (
                  <Button color={copied ? "teal" : "blue"} onClick={copy}>
                    {copied ? "Copied verses" : "Copy verses"}
                  </Button>
                )}
              </CopyButton>
              <Checkbox defaultChecked label="Pasted" />
            </Group>
          </Center>
        </Container>
      </Card.Section>
    </Card>
  );
};

