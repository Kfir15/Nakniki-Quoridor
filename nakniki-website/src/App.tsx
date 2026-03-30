import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './services/UserContext';
import Login from './pages/auth/Login';


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}