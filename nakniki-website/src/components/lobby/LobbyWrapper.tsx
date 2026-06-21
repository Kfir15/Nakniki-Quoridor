import { Flex, Box } from '@radix-ui/themes';
import type { PropsWithChildren } from 'react';

export function LobbyWrapper({ children }: PropsWithChildren) {
    return (
        <Box style={{
            width: '100%',
            flexGrow: 1,
            height: '100%',
            maxHeight: 'calc(100vh - 150px)',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            boxSizing: 'border-box'
        }}>

            <Flex direction="column" style={{
                width: '100%',
                maxWidth: '1136px',
                height: '100%',
                margin: '0 auto',
                padding: '32px 24px',
                boxSizing: 'border-box',
                overflow: 'hidden',
                minHeight: 0
            }}>
                <Flex direction="column" style={{ /* ...same... */ }}>
                {children}
            </Flex></Flex> </Box>)
}