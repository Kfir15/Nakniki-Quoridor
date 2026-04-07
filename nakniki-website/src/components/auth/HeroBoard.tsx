import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    PresentationControls,
    Float,
    Environment,
    Cylinder,
    RoundedBox,
    Sphere,
    ContactShadows
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// define the tiles
const Tile = ({ position }: { position: [number, number, number] }) => (
    <RoundedBox args={[0.9, 0.2, 0.9]} radius={0.05} smoothness={4} position={position} receiveShadow castShadow>
        <meshStandardMaterial color="#2c1e16" roughness={0.4} metalness={0.3} />
    </RoundedBox>
);

// define the leds arount the board
const LedNode = ({ position, color }: { position: [number, number, number], color: string }) => (
    <group position={position}>
        <Sphere args={[0.08, 16, 16]}>
            <meshStandardMaterial emissive={color} emissiveIntensity={10} color={color} />
        </Sphere>
        <pointLight distance={4} intensity={5} color={color} />
    </group>
);

// define the walls
const Wall = ({ position, isHorizontal }: { position: [number, number, number], isHorizontal?: boolean }) => {
    const args: [number, number, number] = isHorizontal ? [1.95, 0.5, 0.15] : [0.15, 0.5, 1.95];

    return (
        <RoundedBox args={args} radius={0.03} smoothness={4} position={position} castShadow>
            <meshStandardMaterial
                color="#b71c1c"
                roughness={0.2}
                metalness={0.1}
                emissive="#ff0000"
                emissiveIntensity={0.1}
            />
        </RoundedBox>
    );
};

// define the pawns
const Pawn = ({ position, color }: { position: [number, number, number], color: string }) => (
    <group position={position}>
        <Cylinder args={[0.2, 0.3, 0.8, 32]} position={[0, 0.4, 0]} castShadow>
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
        </Cylinder>
        <Sphere args={[0.25, 32, 32]} position={[0, 0.9, 0]} castShadow>
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} />
        </Sphere>
    </group>
);

// build the board
const QuoridorBoard = () => {
    const boardRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (boardRef.current) {
            boardRef.current.rotation.y += 0.003;
            boardRef.current.scale.lerp(new THREE.Vector3(0.6, 0.6, 0.6), 0.03);
            boardRef.current.position.y = THREE.MathUtils.lerp(boardRef.current.position.y, 0, 0.03);
        }
    });

    const tiles = [];
    for (let x = -4; x <= 4; x++) {
        for (let z = -4; z <= 4; z++) {
            tiles.push(<Tile key={`tile-${x}-${z}`} position={[x, 0, z]} />);
        }
    }

    return (
        <group ref={boardRef} scale={0} position={[0, -2, 0]}>
            {tiles}

            <RoundedBox args={[9.5, 0.4, 9.5]} radius={0.1} smoothness={4} position={[0, -0.2, 0]} receiveShadow>
                <meshStandardMaterial color="#111111" roughness={0.8} metalness={0.5} />
            </RoundedBox>

            {/* put leds */}
            <LedNode position={[4.5, 0.1, 4.5]} color="#ff0000" />
            <LedNode position={[-4.5, 0.1, 4.5]} color="#ff0000" />
            <LedNode position={[4.5, 0.1, -4.5]} color="#ff0000" />
            <LedNode position={[-4.5, 0.1, -4.5]} color="#ff0000" />
            <LedNode position={[0, 0.1, 4.5]} color="#ff0000" />
            <LedNode position={[0, 0.1, -4.5]} color="#ff0000" />

            {/* put walls */}
            <Wall position={[-0.5, 0.25, 3.5]} isHorizontal={true} />
            <Wall position={[0.5, 0.25, 1.5]} isHorizontal={false} />
            <Wall position={[-1.5, 0.25, 1.5]} isHorizontal={false} />
            <Wall position={[0.5, 0.25, 0.5]} isHorizontal={true} />
            <Wall position={[-1.5, 0.25, -0.5]} isHorizontal={true} />
            <Wall position={[2.5, 0.25, 1.5]} isHorizontal={false} />
            <Wall position={[1.5, 0.25, -1.5]} isHorizontal={true} />
            <Wall position={[-2.5, 0.25, -1.5]} isHorizontal={false} />
            <Wall position={[3.5, 0.25, -0.5]} isHorizontal={false} />

            {/* put pawns */}
            <Pawn position={[-1, 0.1, 2]} color="#ffffff" />
            <Pawn position={[2, 0.1, -1]} color="#111111" />
        </group>
    );
};

// return the complete board
export default function HeroBoard() {
    const [isReady, setIsReady] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isReady ? 1 : 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
            <Canvas
                camera={{ position: [0, 16, 24], fov: 28, near: 0.1, far: 2000 }}
                shadows
                gl={{ alpha: true, antialias: true }}
                onCreated={() => setIsReady(true)}
            >
                <Environment preset="city" />
                <PresentationControls
                    global
                    cursor={true}
                    rotation={[0, Math.PI / 4, 0]}
                    polar={[-Math.PI / 5, Math.PI / 4]}
                    azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
                    snap={true}
                >
                    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
                        <QuoridorBoard />
                    </Float>
                </PresentationControls>
                <ContactShadows position={[0, -4, 0]} opacity={0.8} scale={35} blur={3} far={15} color="#ff0000" />
            </Canvas>
        </motion.div>
    );
}