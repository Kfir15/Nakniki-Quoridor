import { Callout } from '@radix-ui/themes';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';

// error inside form
export default function FormError({ message }: { message: string }) {
    return (
        // animate the error msg
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <Callout.Root color="red" size="1">
                        <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
                        <Callout.Text>{message}</Callout.Text>
                    </Callout.Root>
                </motion.div>
            )}
        </AnimatePresence>
    );
}