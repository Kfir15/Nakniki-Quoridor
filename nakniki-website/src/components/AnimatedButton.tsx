import React from 'react';
import { Button } from '@radix-ui/themes';
import { motion } from 'framer-motion';

type AnimatedButtonProps = React.ComponentProps<typeof Button>;

// animated button
export default function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%' }}
        >
            <Button
                {...props}
                style={{ cursor: 'pointer', width: '100%', ...props.style }}
            >
                {children}
            </Button>
        </motion.div>
    );
}