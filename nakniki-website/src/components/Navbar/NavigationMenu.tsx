// src/components/Navbar/NavigationMenu.tsx
import { Flex, Box, Text } from '@radix-ui/themes';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

export default function NavigationMenu() {
    const location = useLocation();
    const [hoveredNav, setHoveredNav] = useState<string | null>(null);

    useEffect(() => {
        setHoveredNav(null);
    }, [location.pathname]);

    const navItems = useMemo(() => [
        { label: 'HOME', path: '/' },
        { label: 'LEADERBOARD', path: '/leaderboard' },
        { label: 'HOW TO PLAY', path: '/how-to-play' }
    ], []);

    const activeNavLabel = hoveredNav || navItems.find(i => i.path === location.pathname)?.label;

    return (
        <Flex onMouseLeave={() => setHoveredNav(null)} className="rn-nav-container">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isHovered = hoveredNav === item.label;
                const hasPill = activeNavLabel === item.label;

                return (
                    <Link key={item.label} to={item.path} style={{ textDecoration: 'none', position: 'relative' }}>
                        <Box onMouseEnter={() => setHoveredNav(item.label)} className="rn-nav-box">

                            <Text size="2" weight="bold" className="rn-nav-text" style={{
                                color: (isActive || isHovered) ? 'white' : 'rgba(255,255,255,0.4)',
                            }}>
                                {item.label}
                            </Text>

                            {hasPill && (
                                <motion.div
                                    layoutId="nav-glow-pill"
                                    className="rn-highlight-pill"
                                    transition={{ type: "spring", stiffness: 450, damping: 35, mass: 0.8 }}
                                    style={{
                                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                                    }}
                                />
                            )}
                        </Box>
                    </Link>
                );
            })}
        </Flex>
    );
}