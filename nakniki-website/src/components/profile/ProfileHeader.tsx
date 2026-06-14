import RankBadge from '../RankBadge';
import AnimatedButton from '../AnimatedButton';
import { GearIcon } from "@radix-ui/react-icons";
import { Avatar, Flex, Text, Box } from "@radix-ui/themes";
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';

interface HeaderProps {
    name: string;
    email: string;
    date: string;
    rankData: any;
    hero: boolean;
    avatarURL: string | null;
    onClick?: () => void;
}

export default function ProfileHeader( {name, email, date, rankData, hero = true, avatarURL, onClick}: HeaderProps ) {
    return (
       <Box style={{
            backgroundColor: 'rgba(15, 15, 15, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '32px 40px',
            boxShadow: 'inset 0 6px 20px rgba(255,255,255,0.02)',}}>
            
            <Flex align="center" justify="center" gap="9">
                <Avatar 
                    src={avatarURL || undefined}
                    fallback={name.charAt(0).toUpperCase()}
                    size="8"
                    radius="full"
                    style={{ boxShadow: `0 0 20px ${UI.COLORS.P2.GLOW}` }}
                    />

                    <Flex direction="column" justify="center" gap="2">
                                <Text size="5"><strong>{name}</strong></Text>
                                <Flex align="center" style={{ opacity: 0.6 }}>
                                    <Text size="1" weight="bold" style={{ letterSpacing: '1px' }}>
                                        PLAYING SINCE {date.toUpperCase()}
                                    </Text>
                                    
                                </Flex>
                                <Text size="1" weight="bold" style={{ letterSpacing: '1px' }}>
                                        EMAIL: {email.toUpperCase()}
                                    </Text>
                                
                            </Flex>
                            <Flex direction="column" gap="4" align="center">
                                <AnimatedButton onClick={onClick} size="3"> 
                                    <Flex align="center" gap="4" style={{color: "white"}}>
                                        <GearIcon></GearIcon>
                                        Edit Profile </Flex>
                                    </AnimatedButton>
                                <RankBadge rankData={rankData} hero={hero}></RankBadge>
                            </Flex>
                            
            </Flex>
        </Box>
       
        
    );
}
// Need: profile picture, name, email, date joined, rank, edit button