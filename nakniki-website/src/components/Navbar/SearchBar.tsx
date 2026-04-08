import { TextField, Flex, Text, Avatar, Box, Skeleton, IconButton } from '@radix-ui/themes';
import { Search, Shield, UserX, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { sendGet } from '../../services/api';
import { useUser } from '../../services/UserContext';
import FloatingError from '../error/FloatingError';
import UserContextPopup, { type SearchedUser } from '../UserContextPopup';

export default function SearchBar() {
    // state variables
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
    const isExpanded = isFocused || searchQuery.length > 0;
    const { user } = useUser();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // listen if user click outside the search bar
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // if user click, close the search bar
                setIsFocused(false);
                setSearchQuery('');
                setSearchResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // handle search
    useEffect(() => {
        // check that the user insert query
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsLoading(false);
            return;
        }

        // start loading
        setIsLoading(true);
        let isCancelled = false;

        const delayDebounceFn = setTimeout(async () => {
            try {
                // get the users from tha api
                const response = await sendGet(`/users/search?q=${searchQuery}`, user?.token);

                if (!isCancelled) {
                    // set the search results
                    if (response.status === 200) {
                        setSearchResults(response.data);
                        setError('');
                    } else {
                        setError('Search failed to fetch results.');
                    }
                }
            } catch (err) {
                if (!isCancelled) {
                    setError('An error occurred while communicating with the database.');
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }, 300);

        return () => {
            clearTimeout(delayDebounceFn);
            isCancelled = true;
        };
    }, [searchQuery, user?.token]);

    // when user select user to see in pop up
    const handleUserClick = (user: SearchedUser) => {
        setSelectedUser(user);
        setSearchQuery('');
        setIsFocused(false);
    }

    return (
        <Box ref={containerRef} style={{ position: 'relative' }}>
            {/* if there is an error, show it */}
            {error && <FloatingError message={error} onClose={() => setError('')} />}

            <motion.div
                animate={{ width: isExpanded ? 240 : 40 }}
                transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
            >
                <TextField.Root
                    ref={inputRef}
                    radius="full"
                    placeholder={isExpanded ? "Search Users..." : ""}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        height: '36px',
                        color: 'white',
                        width: '100%'
                    }}
                >
                    {/* search input */}
                    <TextField.Slot side="left" pl="3">
                        <Search size={14} color="var(--gray-11)" />
                    </TextField.Slot>

                    {searchQuery.length > 0 && (
                        <TextField.Slot side="right" pr="2">
                            <IconButton
                                size="1"
                                variant="ghost"
                                radius="full"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    setSearchQuery('');
                                    setSearchResults([]);
                                    setIsFocused(true);

                                    setTimeout(() => {
                                        inputRef.current?.focus();
                                    }, 0);
                                }}
                                style={{ color: 'var(--gray-11)', cursor: 'pointer' }}
                            >
                                <X size={14} />
                            </IconButton>
                        </TextField.Slot>
                    )}
                </TextField.Root>
            </motion.div>

            <AnimatePresence>
                {isExpanded && searchQuery.trim().length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '46px',
                            left: 0,
                            width: '100%',
                            backgroundColor: 'rgba(10, 10, 10, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '6px',
                            zIndex: 200,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* if loading results, show skeleton */}
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Flex key={i} align="center" justify="between" p="2">
                                    <Flex align="center" gap="3">
                                        <Skeleton width="24px" height="24px" />
                                        <Skeleton width="80px" height="14px" />
                                    </Flex>
                                    <Skeleton width="30px" height="12px" />
                                </Flex>
                            ))
                            // show the results
                        ) : searchResults.length > 0 ? (
                            searchResults.map((result) => (
                                <Flex
                                    key={result.username}
                                    align="center"
                                    justify="between"
                                    onMouseDown={() => handleUserClick(result)}
                                    style={{
                                        padding: '8px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    {/* for each player, show avatar, username and elo */}
                                    <Flex align="center" gap="3">
                                        <Avatar
                                            src={result.avatar_url}
                                            fallback={result.username.charAt(0).toUpperCase()}
                                            radius="full"
                                            size="1"
                                        />
                                        <Flex direction="column">
                                            <Text size="2" weight="bold" style={{ color: 'white', lineHeight: 1.2 }}>
                                                {result.username}
                                            </Text>
                                        </Flex>
                                    </Flex>

                                    <Flex align="center" gap="1">
                                        <Shield size={12} color="var(--red-9)" />
                                        <Text size="1" weight="bold" style={{ color: 'var(--red-9)' }}>
                                            {result.elo_rating}
                                        </Text>
                                    </Flex>
                                </Flex>
                            ))
                        ) : (
                            // if no players found, show message
                            <Flex direction="column" align="center" justify="center" p="4" gap="2" style={{ opacity: 0.6 }}>
                                <UserX size={20} color="var(--gray-11)" />
                                <Text size="2" weight="medium" style={{ color: 'var(--gray-11)', textAlign: 'center' }}>
                                    No players found.
                                </Text>
                            </Flex>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <UserContextPopup
                user={selectedUser}
                isOpen={selectedUser !== null}
                onClose={() => setSelectedUser(null)}
            />
        </Box>
    );
}