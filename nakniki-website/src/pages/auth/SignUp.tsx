import React, { useState } from 'react';
import { Flex, Heading, Text, TextField, Box, IconButton, Avatar, Checkbox, Grid } from '@radix-ui/themes';
import { EyeOpenIcon, EyeNoneIcon, UploadIcon } from '@radix-ui/react-icons';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { sendPost } from '../../services/api';
import { compressImage } from '../../services/imageService';
import PrivacyPolicyModal from '../../components/auth/PrivacyPolicyModal';
import SocialAuth from '../../components/auth/SocialAuth';
import AnimatedButton from '../../components/AnimatedButton';
import FormError from '../../components/error/FormError';
import { ENDPOINTS as E } from '../../constants/endpoints.constants';
import { ROUTES as R } from '../../constants/routes.constants'

export default function Signup() {
    // define the state variables
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

    // handle avatars files
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                // try to compress the file
                const originalFile = e.target.files[0];
                const compressed = await compressImage(originalFile);

                // set the new avatar
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

        // passwords must match
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // user must accept terms
        if (!acceptedTerms) {
            setError("You must accept the terms of privacy to continue.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // create the form for the sign up req
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('username', username);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            // try to sign up
            const response = await sendPost(E.AUTH.SIGNUP, undefined, {}, formData);

            // create new session
            const { session } = response.data;
            if (session) {
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token
                });
                if (sessionError) throw sessionError;

                navigate(R.HOME);
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
        <>
            <Box mb="4">
                <Heading size="8" mb="1">Create Account</Heading>
                <Text color="gray" size="3">Join the Nakniki arena</Text>
            </Box>

            {/* sign up form */}
            <form onSubmit={handleSignup}>
                <Flex direction="column" gap="4">

                    <Flex gap="5" align="center">
                        <Flex direction="column" align="center" gap="2">

                            {/* upload avatar */}
                            <label style={{ cursor: 'pointer' }}>
                                <Avatar
                                    size="6"
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
                            <Text size="1" color="gray">Avatar</Text>
                        </Flex>

                        <Flex direction="column" gap="3" style={{ flexGrow: 1 }}>

                            {/* insert username */}
                            <Box>
                                <Text as="div" size="2" mb="1" weight="bold">Username</Text>
                                <TextField.Root type="text" placeholder="Nickname" value={username} onChange={(e) => setUsername(e.target.value)} required />
                            </Box>

                            {/* insert email */}
                            <Box>
                                <Text as="div" size="2" mb="1" weight="bold">Email</Text>
                                <TextField.Root type="email" placeholder="player@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </Box>
                        </Flex>
                    </Flex>

                    <Grid columns="2" gap="3">
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

                        {/* insert confirm password */}
                        <Box>
                            <Text as="div" size="2" mb="1" weight="bold">Confirm Password</Text>
                            <TextField.Root type="password" placeholder="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </Box>
                    </Grid>

                    {/* confirm the privacy policy */}
                    <Flex align="center" gap="3" mt="1">
                        <Checkbox
                            checked={acceptedTerms}
                            onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                            style={{ cursor: 'pointer' }}
                        />
                        <Text size="2">
                            I accept the <PrivacyPolicyModal onAccept={() => setAcceptedTerms(true)} />
                        </Text>
                    </Flex>

                    {/* show error if exist */}
                    <FormError message={error} />

                    {/* sign up btn */}
                    <AnimatedButton type="submit" size="3" loading={loading}>
                        Sign Up
                    </AnimatedButton>

                    {/* social option to  sign up */}
                    <SocialAuth onError={setError} />

                    {/* move to log in */}
                    <Text size="2" align="center">
                        Already registered? <Link to="/login" style={{ color: 'var(--red-9)', textDecoration: 'none' }}>Login here</Link>
                    </Text>

                </Flex>
            </form>
        </>
    );
}