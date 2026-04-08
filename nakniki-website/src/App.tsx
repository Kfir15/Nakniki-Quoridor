import { Routes, Route } from 'react-router-dom';
import { Flex, Box } from '@radix-ui/themes';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AuthLayout from './components/auth/AuthLayout';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/footer/Footer';

export default function App() {
  return (
    <Flex direction="column" style={{ minHeight: '100vh' }}>

      <Navbar />

      <Box style={{ flexGrow: 1 }}>
        <Routes>
          <Route path='/' element={<div className="text-white p-8">Home Page Coming Soon!</div>} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>
        </Routes>
      </Box>

      <Footer />

    </Flex>
  );
}