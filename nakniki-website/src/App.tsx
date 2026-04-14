import { Routes, Route } from 'react-router-dom';
import { Flex, Box } from '@radix-ui/themes';
import { ROUTES as R } from './constants/routes.constants';
import { useEffect } from 'react';
import { socketManager } from './lib/socket.manager';
import { useUser } from './services/UserContext';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AuthLayout from './components/auth/AuthLayout';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/footer/Footer';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import MultiplayerLobby from './pages/lobby/MultiplayerLobby';
import Home from './pages/home/Home';
import WaitingRoom from './pages/lobby/WaitingRoom';
import RoutesRequireAuth from './components/RoutesRequireAuth';

export default function App() {
  const { user } = useUser();

  useEffect(() => {
    const token = user?.token;
    if (token) {
      socketManager.connect(token);
    } else {
      socketManager.disconnect();
    }
  }, [user]);

  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>

      <Navbar />

      <Box style={{ flexGrow: 1 }}>
        <Routes>

          {/* public routes */}
          <Route path={R.HOME} element={<Home />} />
          <Route element={<AuthLayout />}>
            <Route path={R.LOGIN} element={<Login />} />
            <Route path={R.SIGNUP} element={<SignUp />} />
          </Route>

          {/* protected routes */}
          <Route element={<RoutesRequireAuth />}>
            <Route path={R.LEADERBOARD} element={<Leaderboard />} />
            <Route path={R.HOW_TO_PLAY} element={<div>How To Play Page</div>} />
            <Route path={R.PROFILE_BASE} element={<div>Profile Page</div>} />
            <Route path={R.MP_LOBBY} element={<MultiplayerLobby />} />
            <Route path={R.WAITING} element={<WaitingRoom />} />

            <Route path={R.GAME} element={
              <div style={{ padding: '50px', textAlign: 'center', color: 'white', fontSize: '24px' }}>
                Game Board Rendering Here!
              </div>
            } />
          </Route>

        </Routes>
      </Box>

      <Footer />

    </Flex>
  );
}