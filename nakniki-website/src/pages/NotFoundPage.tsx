import { useNavigate } from 'react-router-dom';
import { Box, Flex, Text } from '@radix-ui/themes';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import { useRef, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';
import { ROUTES as R } from '../constants/routes.constants';
import AnimatedButton from '../components/AnimatedButton';

// preload the kermit
useGLTF.preload('/kermit.glb');

// the kermit model component, with rotation
function RotatingKermit() {
    const { scene } = useGLTF('/kermit.glb');
    const modelRef = useRef<THREE.Group>(null);

    useFrame((_, delta) => {
        if (modelRef.current) {
            modelRef.current.rotation.y += delta * 0.5; 
        }
    });

    return (
        <primitive 
            ref={modelRef} 
            object={scene} 
            scale={0.01}
            position={[0, -0.4, 0]} 
        />
    );
}

// notify when the kermit is loaded
function ModelNotifier({ onLoaded }: { onLoaded: () => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onLoaded();
        }, 250);
        return () => clearTimeout(timer);
    }, [onLoaded]);
    
    return null;
}

export default function NotFoundPage() {
    const navigate = useNavigate();
    
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <Box style={{ 
            height: '100dvh', 
            width: '100%', 
            backgroundColor: '#050505', 
            position: 'relative', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none'
            }} />

            <Flex direction="column" align="center" justify="center" gap="5" style={{ height: '100%', padding: '0px 20px 120px 20px', zIndex: 10 }}>
                
                {/* 404 headline */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Flex direction="column" align="center" gap="2">
                        <Flex align="center" gap="3">
                            <AlertTriangle size={32} color="#ef4444" />
                            <Text size="9" weight="bold" style={{ 
                                color: '#ffffff', 
                                letterSpacing: '8px', 
                                textShadow: '0 0 30px rgba(239, 68, 68, 0.6)',
                                fontFamily: 'monospace'
                            }}>
                                404 - PAGE NOT FOUND
                            </Text>
                            <AlertTriangle size={32} color="#ef4444" />
                        </Flex>
                    </Flex>
                </motion.div>

                {/* the 3D kermit model */}
                <Box style={{ width: '100%', maxWidth: '800px', height: '50vh', position: 'relative', margin: '0 auto' }}>

                    <div style={{ 
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        opacity: isLoaded ? 1 : 0,
                        visibility: isLoaded ? 'visible' : 'hidden',
                        transition: 'opacity 1.0s ease-in-out',
                    }}>
                        <Canvas
                            camera={{ position: [0, 0, 5], fov: 45 }}
                            gl={{ alpha: true, antialias: true }}
                            style={{ backgroundColor: '#050505' }}
                            onCreated={({ gl }) => {
                                gl.setClearColor(0x000000, 0);
                            }}
                        >
                            <ambientLight intensity={0.6} />
                            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} color="#ffffff" />
                            <spotLight position={[-10, -10, -10]} intensity={0.5} color="#ef4444" />
                            
                            <Suspense fallback={null}>
                                <RotatingKermit />
                                <Environment preset="city" />
                                <ModelNotifier onLoaded={() => setIsLoaded(true)} />
                            </Suspense>
                        </Canvas>
                    </div>
                </Box>

                {/* go back btn */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                    <Box style={{ width: 'fit-content', margin: '0 auto', marginTop: '-20px' }}>
                        <AnimatedButton 
                            size="4" 
                            variant="surface"
                            onClick={() => navigate(R.HOME)}
                            style={{
                                color: '#ffffff',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                                padding: '24px 48px',
                                fontSize: '1.1rem',
                                letterSpacing: '2px'
                            }}
                        >
                            <Flex align="center" gap="2">
                                <ArrowLeft size={20} />
                                RETURN TO HUB
                            </Flex>
                        </AnimatedButton>
                    </Box>
                </motion.div>

            </Flex>
        </Box>
    );
}