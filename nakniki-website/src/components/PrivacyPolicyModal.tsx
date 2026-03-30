import { Flex, Text, Button, Box, Dialog } from '@radix-ui/themes';

interface PrivacyPolicyModalProps {
    onAccept: () => void;
}

export default function PrivacyPolicyModal({ onAccept }: PrivacyPolicyModalProps) {
    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <Text
                    style={{
                        color: 'var(--blue-9)',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Privacy Policy
                </Text>
            </Dialog.Trigger>

            {/* privacy policy */}
            <Dialog.Content style={{ maxWidth: 500 }}>
                <Dialog.Title>Privacy Policy & Terms of Service</Dialog.Title>
                <Dialog.Description size="2" mb="4" color="gray">
                    Please review our terms and data practices before creating your account.
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <Box>
                        <Text as="div" weight="bold" size="2">1. Data Collection and Usage</Text>
                        <Text as="div" size="2" color="gray">
                            We collect your email address and username to secure your account and manage your
                            profile. We do not sell or share your personal contact information with third-party advertisers.
                        </Text>
                    </Box>

                    <Box>
                        <Text as="div" weight="bold" size="2">2. Leaderboard and Public Statistics</Text>
                        <Text as="div" size="2" color="gray">
                            By participating in matches, your username, Elo rating, and win/loss statistics
                            will be displayed publicly on the leaderboard for competitive ranking purposes.
                        </Text>
                    </Box>

                    <Box>
                        <Text as="div" weight="bold" size="2">3. Account Conduct</Text>
                        <Text as="div" size="2" color="gray">
                            Users are expected to maintain fair play. Any use of automated scripts, bots,
                            or exploitation of game mechanics may lead to temporary or permanent account suspension.
                        </Text>
                    </Box>

                    <Box>
                        <Text as="div" weight="bold" size="2">4. Third-Party Authentication</Text>
                        <Text as="div" size="2" color="gray">
                            If you authenticate via Google or GitHub, we only access the profile information
                            permitted by your provider's settings to create and verify your session.
                        </Text>
                    </Box>
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray" style={{ cursor: 'pointer' }}>Cancel</Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button onClick={onAccept} style={{ cursor: 'pointer' }}>Accept and Continue</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}