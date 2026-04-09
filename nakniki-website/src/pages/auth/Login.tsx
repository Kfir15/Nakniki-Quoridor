import React, { useState } from 'react';
import { Flex, Heading, Text, TextField, Box, IconButton } from '@radix-ui/themes';
import { EyeOpenIcon, EyeNoneIcon } from '@radix-ui/react-icons';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { sendPost } from '../../services/api';
import SocialAuth from '../../components/auth/SocialAuth';
import AnimatedButton from '../../components/AnimatedButton';
import FormError from '../../components/error/FormError';
import { ENDPOINTS as E } from '../../constants/endpoints.constants';
import { ROUTES as R } from '../../constants/routes.constants'
import { HttpStatus } from '../../constants/http.constants';

export default function Login() {
    // define the state variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // handle login request
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // try to login with email and password
            const response = await sendPost(E.AUTH.SIGNIN, undefined, {}, { email, password });
            const { access_token, refresh_token } = response.data;

            // create session
            const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
            if (sessionError) throw sessionError;

            navigate(R.HOME);
        } catch (error: any) {
            // print error message base on the status
            const message = error.response?.data?.error || error.message;
            if (error.response && error.response.status === HttpStatus.BAD_REQUEST) {
                setError("Email and password are required.");
            } else if (error.response && error.response.status === HttpStatus.NOT_FOUND) {
                setError("Invalid email or password.");
            } else {
                setError(message || "Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Box mb="8">
                <Heading size="8" mb="2">Welcome Back</Heading>
                <Text color="gray" size="3">Login to start your next match</Text>
            </Box>

            {/* create the login form */}
            <form onSubmit={handleLogin}>
                <Flex direction="column" gap="5">

                    {/* email input */}
                    <Box>
                        <Text as="div" size="2" mb="2" weight="bold">Email</Text>
                        <TextField.Root
                            type="email"
                            placeholder="player@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Box>

                    {/* password input */}
                    <Box>
                        <Text as="div" size="2" mb="2" weight="bold">Password</Text>
                        <TextField.Root
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleLogin(e);
                                if (e.key === 'Escape') setPassword('');
                            }}
                            required
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

                    {/* show error if exist */}
                    <FormError message={error} />

                    {/* login btn */}
                    <AnimatedButton type="submit" size="3" loading={loading}>
                        Log In
                    </AnimatedButton>

                    {/* social log in options */}
                    <SocialAuth onError={setError} />

                    {/* go to sign up */}
                    <Text size="2" align="center" mt="2">
                        New player? <Link to="/signup" style={{ color: 'var(--red-9)', textDecoration: 'none' }}>Register here</Link>
                    </Text>
                </Flex>
            </form>
        </>
    );
}