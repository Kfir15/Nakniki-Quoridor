import React, { useState } from 'react';
import { Flex, Card, Heading, Text, TextField, Button, Box, IconButton, Callout } from '@radix-ui/themes';
import { EyeOpenIcon, EyeNoneIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { sendPost } from '../../services/api';
import BackButton from '../../components/BackButton';
import SocialAuth from '../../components/SocialAuth';

export default function Login() {
    // create the state variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // start loading
        setLoading(true);
        setError('');

        try {
            // try to login the user
            const response = await sendPost('/auth/signin', undefined, {}, { email, password });
            const { access_token, refresh_token } = response.data;

            // start session
            const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
            if (sessionError) throw sessionError;

            // after success navigate to home
            navigate('/')
        } catch (error: any) {
            const message = error.response?.data?.error || error.message;

            // show message base on the status
            if (error.response && error.response.status === 400) {
                setError("Email and password are required.");
            } else if (error.response && error.response.status === 404) {
                setError("Invalid email or password.");
            } else {
                setError(message || "Something went wrong. Please try again.");
            }
        } finally {
            // stop loading
            setLoading(false);
        }
    }

    return (
        <Flex align="center" justify="center" style={{ minHeight: '100vh', background: 'var(--gray-2)' }}>

            <BackButton />

            <Card size="4" style={{ width: 450, padding: 20 }}>
                <form onSubmit={handleLogin}>
                    <Flex direction="column" gap="4">
                        <Heading size="6" align="center">
                            Welcome To Nakniki Quoridor
                        </Heading>

                        {/* insert email */}
                        <Box>
                            <Text as="div" size="2" mb="1" weight="bold">Email</Text>
                            <TextField.Root
                                type="email"
                                placeholder="player@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Box>

                        {/* insert password */}
                        <Box>
                            <Text as="div" size="2" mb="1" weight="bold">Password</Text>

                            <TextField.Root
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleLogin(e);
                                    }
                                    if (e.key === 'Escape') {
                                        setPassword('');
                                    }
                                }}
                                required
                                size="2"
                            >
                                {/* show password btn */}
                                <TextField.Slot side="right" px="1">
                                    <IconButton
                                        size="1"
                                        variant="ghost"
                                        color="gray"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeNoneIcon height="14" width="14" /> : <EyeOpenIcon height="14" width="14" />}
                                    </IconButton>
                                </TextField.Slot>
                            </TextField.Root>
                        </Box>

                        {/* if there was an error show it */}
                        {error && (
                            <Callout.Root color="red" size="1">
                                <Callout.Icon>
                                    <ExclamationTriangleIcon />
                                </Callout.Icon>
                                <Callout.Text>
                                    {error}
                                </Callout.Text>
                            </Callout.Root>
                        )}

                        <Button type="submit" size="3" loading={loading} style={{ cursor: 'pointer' }}>
                            Sign In
                        </Button>

                        {/* continue with social profile */}
                        <SocialAuth onError={setError} />

                        <Text size="2" align="center" mt="3">
                            New player? <Link to="/signup" style={{ color: 'var(--blue-9)', textDecoration: 'none' }}>Register here</Link>
                        </Text>
                    </Flex>
                </form>
            </Card>
        </Flex>
    );
}