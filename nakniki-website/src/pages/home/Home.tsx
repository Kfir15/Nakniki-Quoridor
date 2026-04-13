import { useUser } from "../../services/UserContext";
import RegisterHome from "./RegisterHome";
import UnregisterHome from "./UnregisterHome";

export default function Home() {
    const { user } = useUser();

    // return home page based on register user
    if (user) {
        return <RegisterHome />
    }

    return <UnregisterHome />
}