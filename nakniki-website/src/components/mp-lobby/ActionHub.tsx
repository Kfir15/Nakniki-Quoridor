import { useState } from 'react';
import { Flex, Text, Button, Card, TextField } from '@radix-ui/themes';
import { Play, Lock, Globe, ChevronRight } from 'lucide-react';

interface ActionHubProps {
    createLobby: (isPublic: boolean) => void;
    joinLobby: (code: string) => void;
    isCreating: boolean;
}

export function ActionHub({ createLobby, joinLobby, isCreating }: ActionHubProps) {
    const [joinCode, setJoinCode] = useState('');

    return (
        <Flex direction="column" gap="5">

            {/* headline */}
            <Card size="3" style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <Text weight="bold" size="4" mb="4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={18} /> Host a Match
                </Text>
                <Flex direction="column" gap="3">
                    {/* create public match btn */}
                    <Button
                        size="4"
                        variant="solid"
                        onClick={() => createLobby(true)}
                        disabled={isCreating}
                        style={{ cursor: 'pointer', width: '100%', justifyContent: 'space-between' }}
                    >
                        <Flex align="center" gap="2"><Globe size={18} /> Public Match</Flex>
                        <ChevronRight size={18} />
                    </Button>
                    {/* create private match btn */}
                    <Button
                        size="4"
                        variant="soft"
                        color="gray"
                        onClick={() => createLobby(false)}
                        disabled={isCreating}
                        style={{ cursor: 'pointer', width: '100%', justifyContent: 'space-between' }}
                    >
                        <Flex align="center" gap="2"><Lock size={18} /> Private Match</Flex>
                        <ChevronRight size={18} />
                    </Button>
                </Flex>
            </Card>

            {/* join match by lobby code */}
            <Card size="3" style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <Text weight="bold" size="4" mb="2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={18} /> Lobby Code Access
                </Text>
                <Text size="2" color="gray" mb="4">
                    Enter a lobby code to join a specific match directly.
                </Text>
                <Flex gap="2">
                    <TextField.Root
                        size="3"
                        placeholder="Enter Code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        style={{ flexGrow: 1, textTransform: 'uppercase' }}
                    />
                    <Button
                        size="3"
                        onClick={() => joinCode && joinLobby(joinCode)}
                        disabled={!joinCode || isCreating}
                        style={{ cursor: 'pointer' }}
                    >
                        Join
                    </Button>
                </Flex>
            </Card>
        </Flex>
    );
}