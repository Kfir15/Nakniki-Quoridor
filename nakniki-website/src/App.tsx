import { Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AuthLayout from './components/auth/AuthLayout';
export default function App() {
  return (
    <Routes>
      <Route path='/' />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

    </Routes>
  );
}