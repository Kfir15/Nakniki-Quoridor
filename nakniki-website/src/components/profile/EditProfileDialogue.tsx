import React, { useState, useEffect } from 'react';
import { Dialog, Flex, Text, TextField, Box, Button, Avatar } from '@radix-ui/themes';
import { UploadIcon } from '@radix-ui/react-icons';
import { useUser } from '../../services/UserContext';
import { sendPut } from '../../services/api';
import { compressImage } from '../../services/imageService';
import { ENDPOINTS as E } from '../../constants/endpoints.constants';
import FormError from '../error/FormError';

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentUsername: string;
    currentAvatar: string | null;
    onSaved: () => void;
}

export default function EditProfileDialog({
    open, onOpenChange, currentUsername, currentAvatar, onSaved,
}: EditProfileDialogProps) {
    const { user } = useUser();
    const [username, setUsername] = useState(currentUsername);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // whenever the dialog  reopens, reset the form back to the current values
    useEffect(() => {
        if (open) {
            setUsername(currentUsername);
            setAvatarPreview(currentAvatar);
            setAvatarFile(null);
            setError('');
        }
    }, [open, currentUsername, currentAvatar]);

    // compress + preview a newly picked avatar
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressed = await compressImage(e.target.files[0]);
                setAvatarFile(compressed);
                setAvatarPreview(URL.createObjectURL(compressed));
                setError('');
            } catch {
                setError('Failed to process image.');
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = username.trim();
        if (!trimmed) {
            setError('Username cannot be empty.');
            return;
        }
        // nothing actually changed → just close
        if (trimmed === currentUsername && !avatarFile) {
            onOpenChange(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            // only send what changed; an avatar file makes this multipart automatically
            const formData = new FormData();
            if (trimmed !== currentUsername) formData.append('username', trimmed);
            if (avatarFile) formData.append('avatar', avatarFile);

            await sendPut(E.USERS.UPDATE, user?.token, {}, formData);

            onSaved();             // tell to refresh the profile
            onOpenChange(false);   // close the dialog
        } catch (err: any) {
            // backend returns 409 when the username is taken
            if (err.response?.status === 409) {
                setError('That username is already taken.');
            } else {
                setError(err.response?.data?.error || err.message || 'Failed to update profile.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Content maxWidth="420px">
                <Dialog.Title>Edit Profile</Dialog.Title>
                <Dialog.Description size="2" color="gray" mb="4">
                    Update your username or avatar.
                </Dialog.Description>

                <form onSubmit={handleSave}>
                    <Flex direction="column" gap="4">
                        {/* avatar picker */}
                        <Flex direction="column" align="center" gap="2">
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
                            <Text size="1" color="gray">Click to change avatar</Text>
                        </Flex>

                        {/* username */}
                        <Box>
                            <Text as="div" size="2" mb="1" weight="bold">Username</Text>
                            <TextField.Root
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Your username"
                            />
                        </Box>

                        <FormError message={error} />

                        {/* actions */}
                        <Flex gap="3" justify="end" mt="2">
                            <Button type="button" variant="soft" color="gray" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading}>
                                Save
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}
