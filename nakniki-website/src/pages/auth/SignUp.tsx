import React, { useState } from 'react';
import { Flex, Card, Heading, Text, TextField, Button, Box, IconButton, Callout, Separator, Avatar, Checkbox } from '@radix-ui/themes';
import { EyeOpenIcon, EyeNoneIcon, ExclamationTriangleIcon, UploadIcon } from '@radix-ui/react-icons';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { sendPost } from '../../services/api';
import { compressImage } from '../../services/imageService';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';
import BackButton from '../../components/BackButton';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                // compress the image
                const originalFile = e.target.files[0];
                const compressed = await compressImage(originalFile);

                // set the avatar
                setAvatarFile(compressed);
                setAvatarPreview(URL.createObjectURL(compressed));
                setError('');
            } catch (err) {
                setError("Failed to process image.");
            }
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // password and confirm passsword must be the same
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // user musr accept the terms
        if (!acceptedTerms) {
            setError("You must accept the terms of privacy to continue.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // create formdata of the user context
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('username', username);

            // add the avatar file
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            // try to sign up
            const response = await sendPost('/auth/signup', undefined, {}, formData);

            // start the session
            const { session } = response.data;
            if (session) {
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token
                });
                if (sessionError) throw sessionError;

                // success - navigate to home
                navigate('/');
            } else {
                setError("Account created! Please check your email for a confirmation link.");
            }

        } catch (error: any) {
            setError(error.response?.data?.error || error.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // login with google account
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setError(error.message || "Failed to initialize Google login.");
        }
    };

    const handleGithubLogin = async () => {
        try {
            // login with github account
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setError(error.message || "Failed to initialize GitHub login.");
        }
    };

    return (
        <Flex align="center" justify="center" style={{ minHeight: '100vh', background: 'var(--gray-2)', padding: '20px' }}>

            <BackButton />

            <Card size="4" style={{ width: 450, padding: 20 }}>
                <form onSubmit={handleSignup}>
                    <Flex direction="column" gap="4">
                        <Heading size="6" align="center">Create an Account</Heading>

                        {/* upload avatar */}
                        <Flex direction="column" align="center" gap="2">
                            <Text size="1" color="gray">Upload Player Avatar</Text>
                            <label style={{ cursor: 'pointer' }}>
                                <Avatar
                                    size="7"
                                    src={avatarPreview || undefined}
                                    fallback={<UploadIcon width="24" height="24" />}
                                    radius="full"
                                    style={{ border: '2px dashed var(--gray-6)' }}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </label>
                        </Flex>

                        {/* insert username */}
                        <Box>
                            <Text as="div" size="2" mb="1" weight="bold">Username</Text>
                            <TextField.Root
                                type="text"
                                placeholder="Nickname"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Box>

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
                            <TextField.Root type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required>
                                <TextField.Slot side="right" px="1">
                                    <IconButton size="1" variant="ghost" color="gray" type="button" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
                                    </IconButton>
                                </TextField.Slot>
                            </TextField.Root>
                        </Box>

                        {/* confirm password */}
                        <Box>
                            <Text as="div" size="2" mb="1" weight="bold">Confirm Password</Text>
                            <TextField.Root type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </Box>

                        {/* terms of privacy checkbox */}
                        <Flex align="center" gap="2">
                            <Checkbox
                                checked={acceptedTerms}
                                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                                style={{ cursor: 'pointer' }}
                            />
                            <Text size="2">
                                I accept the {' '}
                                <PrivacyPolicyModal onAccept={() => setAcceptedTerms(true)} />
                            </Text>
                        </Flex>

                        {/* show error */}
                        {error && (
                            <Callout.Root color="red" size="1">
                                <Callout.Icon><ExclamationTriangleIcon /></Callout.Icon>
                                <Callout.Text>{error}</Callout.Text>
                            </Callout.Root>
                        )}

                        <Button type="submit" size="3" loading={loading} style={{ cursor: 'pointer' }}>Sign Up</Button>

                        {/* continue with seperator */}
                        <Flex align="center" gap="3" mt="1" mb="1">
                            <Separator size="4" style={{ flex: 1 }} />
                            <Text size="1" color="gray" weight="bold">
                                OR CONTINUE WITH
                            </Text>
                            <Separator size="4" style={{ flex: 1 }} />
                        </Flex>

                        {/* google btn */}
                        <Flex gap="3">
                            <Button
                                type="button"
                                variant="soft"
                                color="gray"
                                size="3"
                                onClick={handleGoogleLogin}
                                style={{ cursor: 'pointer', flex: 1 }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </Button>

                            {/* github btn */}
                            <Button
                                type="button"
                                variant="soft"
                                color="gray"
                                size="3"
                                onClick={handleGithubLogin}
                                style={{ cursor: 'pointer', flex: 1 }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                GitHub
                            </Button>
                        </Flex>

                        <Text size="2" align="center" mt="3">
                            Already registered? <Link to="/login" style={{ color: 'var(--blue-9)', textDecoration: 'none' }}>Login here</Link>
                        </Text>
                    </Flex>
                </form>
            </Card>
        </Flex>
    );
}