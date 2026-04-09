import { Routes, Route } from 'react-router-dom';
import { Flex, Box } from '@radix-ui/themes';
import { ROUTES as R } from './constants/routes.constants';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AuthLayout from './components/auth/AuthLayout';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/footer/Footer';
import Leaderboard from './pages/Leaderboard/Leaderboard';

export default function App() {
  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>

      <Navbar />

      <Box style={{ flexGrow: 1 }}>
        <Routes>
          <Route path={R.HOME} element={<div>Home Page</div>} />
          <Route path={R.LEADERBOARD} element={<Leaderboard />} />
          <Route path={R.HOW_TO_PLAY} element={<div>How To Play Page</div>} />
          <Route path={R.PROFILE_BASE} element={<div>Profile Page</div>} />

          <Route element={<AuthLayout />}>
            <Route path={R.LOGIN} element={<Login />} />
            <Route path={R.SIGNUP} element={<SignUp />} />
          </Route>
        </Routes>
      </Box>

      <Footer />

    </Flex>
  );
}