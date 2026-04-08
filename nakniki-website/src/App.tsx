import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AuthLayout from './components/auth/AuthLayout';
import Navbar from './components/Navbar/Navbar';

export default function App() {
  return (
    <>

      <Navbar />

      <Routes>
        <Route path='/' element={<div className="text-white p-8">Home Page Coming Soon!</div>} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
      </Routes>
    </>
  );
}