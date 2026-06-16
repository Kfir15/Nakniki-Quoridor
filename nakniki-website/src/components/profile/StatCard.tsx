import { Flex, Text } from '@radix-ui/themes';

interface StatCardProps {
    label: string;
    value: React.ReactNode; // Anything that can be read
    color?: string;
}

export default function StatCard({ label, value, color }: StatCardProps) {
    return (
        <Flex
            direction="column"
            align="center"
            gap="1"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '16px 24px',
                minWidth: '110px',
            }}
        >
            <Text size="6" weight="bold" style={{ color: color ?? 'white' }}>{value}</Text>
            <Text size="1" color="gray" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                {label}
            </Text>
        </Flex>
    );
}