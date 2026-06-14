import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { STEPS } from '../../constants/tutorial.constants';
import BoardBackground from '../../components/home/register-home/BoardBackground';
import MiniBoard from '../../components/tutorial/MiniBoard';
import { ROUTES as R } from '../../constants/routes.constants';


export default function HowToPlay() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);

    const current = STEPS[step];
    const isFirst = step === 0;
    const isLast = step === STEPS.length - 1;

    const back = () => setStep(s => Math.max(0, s - 1));
    const next = () => (isLast ? navigate(R.HOME) : setStep(s => Math.min(STEPS.length - 1, s + 1)));

    return (
        <Box style={{
            width: '100%',
            minHeight: '85vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        }}>
            <BoardBackground />

            <Flex
                direction="column"
                align="center"
                gap="5"
                style={{
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    maxWidth: '520px',
                    padding: '24px',
                }}
            >
                {/* progress dots */}
                <Flex gap="2">
                    {STEPS.map((_, i) => (
                        <Box
                            key={i}
                            style={{
                                width: i === step ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: i === step ? 'var(--red-9)' : 'rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    ))}
                </Flex>

                {/* the step content — keyed by `step` so it re-mounts and fades in on every change */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
                >
                    <MiniBoard {...current.board} />

                    <Text size="7" weight="bold" style={{ letterSpacing: '1px' }}>
                        {current.title}
                    </Text>
                    <Text size="3" color="gray" align="center" style={{ maxWidth: '420px', lineHeight: 1.6 }}>
                        {current.body}
                    </Text>
                </motion.div>

                {/* navigation */}
                <Flex gap="4" align="center" mt="2">
                    <Button size="3" variant="soft" onClick={back} disabled={isFirst}>
                        <ArrowLeft size={16} /> Back
                    </Button>
                    <Text size="2" color="gray">{step + 1} / {STEPS.length}</Text>
                    <Button size="3" onClick={next}>
                        {isLast ? 'Finish' : 'Next'} <ArrowRight size={16} />
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
}
