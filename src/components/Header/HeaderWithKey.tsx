import { Group, Container, PasswordInput, Flex } from '@mantine/core';
import classes from './HeaderWithKey.module.css';


export function HeaderWithKey() {
    return (
        <header className={classes.header}>
            <Container className={classes.inner}>
                <Group gap="lg">
                    <h1>Bible Verse Formatter</h1>
                </Group>
                <Group gap='lg'>
                    <Container w='250px'>
                        <div>Unlock Key</div>
                        <PasswordInput
                            variant="filled"
                            size='lg'
                            radius="md"
                            placeholder="Password"
                        />
                    </Container>
                </Group>
            </Container>
        </header>
    );
}