import { Callout, Box } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingErrorProps {
    message: string;
    onClose: () => void;
}

// floating error on the screen
export default function FloatingError({ message, onClose }: FloatingErrorProps) {
    return (
        // animate the error msg
        <AnimatePresence>
            {message && (
                <Box style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '24px',
                    zIndex: 9999,
                    maxWidth: '450px'
                }}>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        // close the error after 5 seconds
                        onAnimationComplete={() => setTimeout(onClose, 5000)}
                    >
                        {/* show the error msg */}
                        <Callout.Root color="red" variant="surface" style={{ boxShadow: 'var(--shadow-4)' }}>
                            <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
                            <Callout.Text>{message}</Callout.Text>
                        </Callout.Root>
                    </motion.div>
                </Box>
            )}
        </AnimatePresence>
    );
}