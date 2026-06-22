import { Routes, Route, useParams } from 'react-router-dom';
import { Flex, Box } from '@radix-ui/themes';
import { ROUTES as R } from './constants/routes.constants';
import { useEffect } from 'react';
import { socketManager } from './lib/socket.manager';
import { useUser } from './services/UserContext';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AuthLayout from './components/auth/AuthLayout';
import HowToPlay from './pages/tutorial/HowToPlay';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/footer/Footer';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import MultiplayerLobby from './pages/lobby/MultiplayerLobby';
import Home from './pages/home/Home';
import WaitingRoom from './pages/lobby/WaitingRoom';
import RoutesRequireAuth from './components/RoutesRequireAuth';
import GamePage from './pages/game/GamePage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/profile/ProfilePage';
import TournamentLobby from './pages/tournament/TournamentLobby'
import { useTournamentMatchListener } from './hooks/useTournamentMatchListener';

// Force GamePage to fully remount when the game id changes, relevant for tournaments
function GamePageRoute() {
  const { gameId } = useParams();
  return <GamePage key={gameId} />;
}

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
  // Listener to send tournament players to their respective matches at all times
  useTournamentMatchListener();

  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>

      <Navbar />

      <Box style={{ flexGrow: 1 }}>
        <Routes>

          {/* public routes */}
          <Route path={R.HOME} element={<Home />} />
          <Route path={R.NOT_FOUND} element={<NotFoundPage />}/>
          <Route element={<AuthLayout />}>
            <Route path={R.LOGIN} element={<Login />} />
            <Route path={R.SIGNUP} element={<SignUp />} />
          </Route>

          {/* protected routes */}
          <Route element={<RoutesRequireAuth />}>
            <Route path={R.LEADERBOARD} element={<Leaderboard />} />
            <Route path={R.PROFILE_BASE} element={<ProfilePage />} />
            <Route path={R.HOW_TO_PLAY} element={<HowToPlay/>} />
            <Route path={R.MP_LOBBY} element={<MultiplayerLobby />} />
            <Route path={R.WAITING} element={<WaitingRoom />} />
            <Route path={R.GAME} element={<GamePageRoute />} />
            <Route path={R.TOURNAMENTS} element={<TournamentLobby/>} />
          </Route>

        </Routes>
      </Box>

      <Footer />

    </Flex>
  );
}