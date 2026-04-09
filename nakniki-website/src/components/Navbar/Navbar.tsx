import { useLocation } from 'react-router-dom';
import { useUser } from '../../services/UserContext';
import { Box } from '@radix-ui/themes';
import RegisteredNavbar from './RegisteredNavbar';
import UnregisteredNavbar from './UnregisteredNavbar';
import { ROUTES as R } from '../../constants/routes.constants'

export default function Navbar() {
    const location = useLocation();
    const { user, logOut, isLoading } = useUser();

    // hide navbar in this routes
    const hiddenRoutes = [R.LOGIN, R.SIGNUP];
    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route));
    if (shouldHide) return null;

    if (isLoading) {
        return <Box style={{ height: '65px', borderBottom: '1px solid var(--gray-5)', backgroundColor: 'var(--color-background)' }} />;
    }

    // return navbase base on if the user login or not
    return (
        <Box style={{ position: 'sticky', top: 0, zIndex: 50 }}>
            {user ? (
                <RegisteredNavbar user={user} logOut={logOut} />
            ) : (
                <UnregisteredNavbar />
            )}
        </Box>
    );
}