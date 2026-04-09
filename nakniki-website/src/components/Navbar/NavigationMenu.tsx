import { Box, Text } from '@radix-ui/themes';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { ROUTES as R } from '../../constants/routes.constants';

export default function NavigationMenu() {
    const location = useLocation();
    const [hoveredNav, setHoveredNav] = useState<string | null>(null);
    useEffect(() => {
        setHoveredNav(null);
    }, [location.pathname]);

    // the navigation options
    const navItems = useMemo(() => [
        { label: 'HOME', path: R.HOME },
        { label: 'LEADERBOARD', path: R.LEADERBOARD },
        { label: 'HOW TO PLAY', path: R.HOW_TO_PLAY }
    ], []);

    return (
        <div
            onMouseLeave={() => setHoveredNav(null)}
            className="rn-nav-container"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)'
            }}
        >
            {/* for each navigation option */}
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isHovered = hoveredNav === item.label;
                const hasPill = isActive;

                return (
                    // link to the page
                    <Link key={item.label} to={item.path} style={{ textDecoration: 'none', position: 'relative' }}>
                        <Box
                            onMouseEnter={() => setHoveredNav(item.label)}
                            className="rn-nav-box"
                            style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >

                            {/* write the name */}
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
        </div>
    );
}