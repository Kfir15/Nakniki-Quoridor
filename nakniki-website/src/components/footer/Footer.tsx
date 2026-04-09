import { Box, Container, Flex, Separator, Text } from "@radix-ui/themes";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES as R } from '../../constants/routes.constants'

const Footer = () => {
    // hisde the footer in this routes
    const location = useLocation();
    const hiddenRoutes = [R.LOGIN, R.SIGNUP];
    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));
    if (shouldHide) return null;

    return (
        <motion.div
            style={{ width: '100%', marginTop: 'auto' }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
            <Separator size="4" color="red" />

            <Container size="3" p="4" align="left">

                <Flex justify="start" align="start" gap="4" direction="row">
                    <Box width="7VW" />
                    <Box style={{ textAlign: 'left' }}>
                        <Text weight="bold" size="2">Nakniki Quoridor</Text>
                        <Text as="div" size="1" color="gray" style={{ textAlign: 'left' }}>
                            © 2026 All rights (not really) reserved.
                            <br />
                            Made with ❤️ and 🌭 by the Nakniki-team inc.
                            <br />
                            Eden, we remember you!
                        </Text>
                    </Box>

                </Flex>
            </Container>
        </motion.div>
    );
};

export default Footer;