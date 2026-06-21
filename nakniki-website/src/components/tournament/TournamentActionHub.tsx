import { useState } from 'react';
import { Flex, Text, Card, TextField, Button } from '@radix-ui/themes';
import { Trophy, ChevronRight } from 'lucide-react';

interface Props {
    createTournament: (name: string, size: number) => void;
    isCreating: boolean;
}
const SIZES = [4, 8, 16];

export function TournamentActionHub({ createTournament, isCreating }: Props) {
    const [name, setName] = useState('');
    const [size, setSize] = useState(8);

    return (
        <Card size="3" style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <Text weight="bold" size="4" mb="4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={18} /> Create a Tournament
            </Text>
            <Flex direction="column" gap="3">
                <TextField.Root size="3" placeholder="Tournament name"
                    value={name} onChange={(e) => setName(e.target.value)} />

                {/* size picker — three toggle buttons */}
                <Flex gap="2">
                    {SIZES.map((s) => (
                        <Button key={s} size="2" style={{ flexGrow: 1, cursor: 'pointer' }}
                            variant={size === s ? 'solid' : 'soft'}
                            color={size === s ? 'yellow' : 'gray'}
                            onClick={() => setSize(s)}>
                            {s} players
                        </Button>
                    ))}
                </Flex>

                <Button size="4" disabled={!name.trim() || isCreating}
                    color="yellow"
                    onClick={() => createTournament(name.trim(), size)}
                    style={{ cursor: 'pointer', justifyContent: 'space-between' }}>
                    <Flex align="center" gap="2"><Trophy size={18} /> Create</Flex>
                    <ChevronRight size={18} />
                </Button>
            </Flex>
        </Card>
    );
}