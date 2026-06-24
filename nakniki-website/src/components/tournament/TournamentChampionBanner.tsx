
import { Flex, Text, Box, Avatar } from '@radix-ui/themes'
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

interface BannerProps {
    name: string | undefined
    pfp: string | undefined
}

export function TournamentChampionBanner( { name, pfp } : BannerProps) {
    return (
        <Flex direction="column" align="center" gap="2">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Crown size={44} color="gold" />
            </motion.div>
            <Box style={{ position: 'relative' }}>
                <motion.div
                    animate={{ opacity: [0.25, 0.6, 0.25] }} transition={{ duration: 5, repeat: Infinity }}
                    style={{ position: 'absolute', inset: -18, borderRadius: '75%',
                            background: 'radial-gradient(circle, rgba(232, 186, 48, 0.6))',
                            filter: 'blur(18px)', pointerEvents: 'none' }} />
                <Avatar src={pfp ?? undefined} fallback={name?.[0]?.toUpperCase() ?? '?'}
                    size="7" radius="full" style={{ border: '3px solid gold', position: 'relative' }} />
            </Box>
            <Text size="7" weight="bold">{name}</Text>
            <Text color="yellow" weight="bold" style={{ letterSpacing: '2px' }}>CHAMPION</Text>
        </Flex>
    );
}