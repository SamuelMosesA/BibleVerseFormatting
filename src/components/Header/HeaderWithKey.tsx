import { Container, Group, PasswordInput } from '@mantine/core';
import classes from './HeaderWithKey.module.css';

export interface PasswordInput {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
}

export const HeaderWithKey: React.FC<PasswordInput> = ({ password, setPassword }) => {
  return (
    <header className={classes.header}>
      <Container className={classes.inner}>
        <Group gap="lg">
          <h1>Bible Verse Formatter</h1>
        </Group>
        <Group gap="lg">
          <Container w="250px">
            <div>Unlock Key</div>
            <PasswordInput
              variant="filled"
              size="lg"
              radius="md"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Container>
        </Group>
      </Container>
    </header>
  );
};
