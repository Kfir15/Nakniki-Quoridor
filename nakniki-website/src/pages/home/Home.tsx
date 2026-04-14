import { useUser } from "../../services/UserContext";
import RegisterHome from "./RegisterHome";
import UnregisterHome from "./UnregisterHome";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Home() {
    const { user, isLoading } = useUser();

    // wait for auth
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // return home page based on register user
    if (user) {
        return <RegisterHome />
    }

    return <UnregisterHome />
}