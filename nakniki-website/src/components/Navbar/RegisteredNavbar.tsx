import { Flex, Separator, Box } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import SearchBar from './SearchBar';
import UserProfileDropdown from './UserProfileDropdown';
import BrandLogo from './BrandLogo';
import NavigationMenu from './NavigationMenu';
import type { AppUser } from '../../services/UserContext';
import './RegisteredNavbar.css';

interface Props {
    user: AppUser;
    logOut: () => void;
}

export default function RegisteredNavbar({ user, logOut }: Props) {

    return (
        <motion.header
            className="registered-header"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="rn-top-line" />

            <Flex align="center" justify="between" px="6" style={{ width: '100%', position: 'relative' }}>

                {/* nakiniki logo */}
                <BrandLogo />

                {/* navigation menu */}
                <Box style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <NavigationMenu />
                </Box>

                <Flex align="center" gap="5">
                    {/* search users bar */}
                    <SearchBar />

                    <Separator orientation="vertical" size="1" style={{ height: '20px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

                    {/* user dropdown with profile and logout */}
                    <UserProfileDropdown user={user} logOut={logOut} />
                </Flex>
            </Flex>
        </motion.header>
    );
}