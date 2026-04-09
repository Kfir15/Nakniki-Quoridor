import { Flex, Text, Button } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandLogo from './BrandLogo';
import './UnregisteredNavbar.css';
import { ROUTES as R } from '../../constants/routes.constants'

export default function UnregisteredNavbar() {
    const navigate = useNavigate();

    return (
        <motion.header
            className="unregistered-header"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="un-top-line" />

            <Flex align="center" justify="between" px="6" style={{ width: '100%', maxWidth: '1800px' }}>

                {/* nakniki logo */}
                <BrandLogo />

                {/* login and signup btns */}
                <Flex align="center" gap="3">
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                        <Button className="un-login-btn" onClick={() => navigate(R.LOGIN)}>
                            <LogIn size={15} />
                            <Text size="2" weight="medium">Log in</Text>
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                        <Button className="un-signup-btn" onClick={() => navigate(R.SIGNUP)}>
                            <UserPlus size={15} />
                            <Text size="2" weight="medium">Sign up</Text>
                        </Button>
                    </motion.div>
                </Flex>

            </Flex>
        </motion.header>
    );
}