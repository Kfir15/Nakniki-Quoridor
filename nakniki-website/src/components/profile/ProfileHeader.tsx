import { motion } from 'framer-motion'
import { UI_CONSTANTS as UI } from '../../constants/ui.constants';
import RankBadge from '../RankBadge';
import AnimatedButton from '../AnimatedButton';
import { GearIcon } from "@radix-ui/react-icons";
import { IconButton, Box, Avatar, Flex, Text } from "@radix-ui/themes";

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
       <Flex align="center" justify="center" gap="9">
            <Avatar
                src={avatarURL || undefined}   // undefined (not null) so Radix shows the fallback
                fallback={name.charAt(0).toUpperCase()}   // shown when there's no image / it fails to load
                size="8"
                radius="full"
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
       
        
    );
}
// Need: profile picture, name, email, date joined, rank, edit button