import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}