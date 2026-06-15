import { Avatar, Flex, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";

export interface NemesisData {
    pfp?: string;
    name: string;
    wins: number;
    losses: number;
}

const ORANGE = '#f97316';

export default function NemesisCard({ nemesis }: { nemesis: NemesisData | null }) {
    // empty state in case of no rival
    if (!nemesis) {
        return (
            <Flex direction="column" align="center" gap="1" style={{ padding: '24px 32px' }}>
                <Text size="3" weight="bold" color="gray">No rival yet</Text>
                <Text size="2" color="gray">Go lose a some games, Nakniki-noob 🌭</Text>
            </Flex>
        );
    }

    return (
        <Flex
            align="center"
            gap="6"
            style={{
                padding: '24px 44px',
                borderRadius: '20px',
                border: `1px solid ${ORANGE}55`,
                background: `radial-gradient(circle at 28% 30%, ${ORANGE}1f, transparent 70%)`,
            }}
        >
            {/* glowing avatar */}
            <Avatar
                src={nemesis.pfp || undefined}
                fallback={nemesis.name.charAt(0).toUpperCase()}
                size="8"
                radius="full"
                style={{ boxShadow: `0 0 28px ${ORANGE}aa`, border: `2px solid ${ORANGE}` }}
            />

            {/* glowing name column */}
            <Flex direction="column" gap="1">
                <Text size="1" weight="bold" style={{ color: ORANGE, opacity: 0.7, letterSpacing: '3px' }}>
                    YOUR NEMESIS
                </Text>
                <motion.div
                    animate={{
                        textShadow: [
                            '0 0 8px rgba(249,115,22,0.5), 0 0 18px rgba(249,115,22,0.35)',
                            '0 0 16px rgba(249,115,22,0.95), 0 0 34px rgba(249,115,22,0.6)',
                        ],
                    }}
                    transition={{ duration: 0.9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                    style={{
                        color: ORANGE,
                        fontSize: '34px',
                        fontWeight: 900,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                    }}
                >
                    {nemesis.name}
                </motion.div>
            </Flex>

            {/* column for record */}
            <Flex direction="column" align="center" gap="1" style={{ marginLeft: '8px' }}>
                <Text style={{ fontSize: '30px', fontWeight: 900, color: 'white', lineHeight: 1 }}>
                    {nemesis.wins}-{nemesis.losses}
                </Text>
                <Text size="1" color="gray" style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Record
                </Text>
            </Flex>
        </Flex>
    );
}
