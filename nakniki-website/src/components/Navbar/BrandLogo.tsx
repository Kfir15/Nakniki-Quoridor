import { Flex, Text } from '@radix-ui/themes';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BrandLogo() {
    return (
        // put the logo with the game name
        <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src="/nakniki-logo.png" alt="Nakniki Logo" className="rn-logo" />
                <Flex direction="column" justify="center" style={{ paddingTop: '2px' }}>
                    <Text size="4" weight="bold" className="rn-brand-title">NAKNIKI</Text>
                    <Text size="1" weight="bold" className="rn-brand-subtitle">QUORIDOR</Text>
                </Flex>
            </motion.div>
        </Link>
    );
}