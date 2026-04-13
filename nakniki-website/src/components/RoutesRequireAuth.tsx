import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from "../services/UserContext";
import { ROUTES as R } from '../constants/routes.constants'
import LoadingSpinner from "./LoadingSpinner";

const RoutesRequireAuth = () => {
    const { user, isLoading } = useUser();

    // wait for auth
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // if user not auth, return home page
    if (!user) {
        return <Navigate to={R.HOME} replace />;
    }

    return <Outlet />;
};

export default RoutesRequireAuth;