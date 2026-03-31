import React, { useState } from 'react';
import { Flex, Card, Heading, Text, TextField, Button, Box, IconButton, Callout, Avatar, Checkbox } from '@radix-ui/themes';
import { EyeOpenIcon, EyeNoneIcon, ExclamationTriangleIcon, UploadIcon } from '@radix-ui/react-icons';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { sendPost } from '../../services/api';
import { compressImage } from '../../services/imageService';
import PrivacyPolicyModal from '../../components/PrivacyPolicyModal';
import BackButton from '../../components/BackButton';
import SocialAuth from '../../components/SocialAuth';

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
                            <TextField.Root type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
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

                        <Button type="submit" size="3" loading={loading} style={{ cursor: 'pointer' }}>
                            Sign Up
                        </Button>

                        {/* continue with social profile */}
                        <SocialAuth onError={setError} />

                        <Text size="2" align="center" mt="3">
                            Already registered? <Link to="/login" style={{ color: 'var(--blue-9)', textDecoration: 'none' }}>Login here</Link>
                        </Text>
                    </Flex>
                </form>
            </Card>
        </Flex>
    );
}