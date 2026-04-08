import { Flex, Box, Text, Avatar, DropdownMenu } from '@radix-ui/themes';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { AppUser } from '../../services/UserContext';
import { sendGet } from '../../services/api';

interface Props {
    user: AppUser;
    logOut: () => void;
}

export default function UserProfileDropdown({ user, logOut }: Props) {
    const navigate = useNavigate();
    const [elo, setElo] = useState<number>(1200);
    const username = user.user_metadata?.username || 'Player';
    const avatarUrl = user.user_metadata?.avatar_url || undefined;

    useEffect(() => {
        // get player profile
        const fetchProfileData = async () => {
            try {
                // send the request
                const response = await sendGet('/users/profile', user.token);
                if (response.data?.elo_rating) setElo(response.data.elo_rating);
            } catch (error) {
                console.error("Failed to fetch user Elo");
            }
        };
        if (user.token) fetchProfileData();
    }, [user.token]);

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <motion.div whileHover={{ scale: 1.02 }} style={{ cursor: 'pointer' }}>
                    <Flex align="center" gap="3" p="1" pr="3" className="rn-profile-trigger">
                        {/* show player avatar */}
                        <Box style={{ position: 'relative' }}>
                            <Avatar
                                src={avatarUrl}
                                fallback={username.charAt(0).toUpperCase()}
                                radius="full" size="2"
                                className="rn-avatar"
                            />
                            <div className="rn-status-dot" />
                        </Box>

                        {/* show the username and elo */}
                        <Box display={{ initial: 'none', md: 'block' }}>
                            <Text as="div" size="2" weight="bold" style={{ color: 'white', lineHeight: 1 }}>{username}</Text>
                            <Flex align="center" gap="1" style={{ marginTop: '2px' }}>
                                <Shield size={10} color="var(--yellow-9)" />
                                <Text size="1" weight="bold" style={{ color: 'var(--yellow-9)', fontSize: '10px' }}>{elo}</Text>
                            </Flex>
                        </Box>
                    </Flex>
                </motion.div>
            </DropdownMenu.Trigger>

            {/* menu items */}
            <DropdownMenu.Content variant="soft" className="rn-dropdown-content">
                {/* go to profile page */}
                <DropdownMenu.Item onClick={() => navigate(`/profile/${username}`)} style={{ borderRadius: '8px', cursor: 'pointer' }}>
                    <UserIcon size={14} style={{ marginRight: '10px' }} /> Profile
                </DropdownMenu.Item>

                {/* logout */}
                <DropdownMenu.Item color="red" onClick={async () => { await logOut(); navigate('/'); }} style={{ borderRadius: '8px', cursor: 'pointer' }}>
                    <LogOut size={14} style={{ marginRight: '10px' }} /> Logout
                </DropdownMenu.Item>
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
}