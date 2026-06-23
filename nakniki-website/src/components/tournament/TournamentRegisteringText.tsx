import { useEffect, useState } from 'react';
import { Text } from '@radix-ui/themes';

export function TournamentRegisteringText({ isFull }: { isFull: boolean }) {
    const [dots, setDots] = useState(0);
    useEffect(() => {
        if (isFull) return;
        // Every half a second we add a dot
        const id = setInterval(() => setDots(d => (d + 1) % 4), 500);
        return () => clearInterval(id);
    }, [isFull]);

    if (isFull) return <Text color="green" weight="bold">Starting soon!</Text>;
    return (
        <Text color="orange" weight="bold" size="9" align="center">
            Registering
            <span style={{ display: 'inline-block', width: '1.5em', textAlign: 'left' }}>{'.'.repeat(dots)}</span>
        </Text>
    );
}