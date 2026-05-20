import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProfileProvider } from './context/ProfileContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import OwnedMachines from './pages/OwnedMachines'
import MachineDetail from './pages/MachineDetail'
import Calls from './pages/Calls'
import CallDetail from './pages/CallDetail'
import UpdateProfile from './pages/UpdateProfile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import RaiseCall from './pages/RaiseCall'

function AuthenticatedRoutes() {
  return (
    <ProfileProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/machines" element={<OwnedMachines />} />
        <Route path="/machines/:id" element={<MachineDetail />} />
        <Route path="/calls" element={<Calls />} />
        <Route path="/calls/:id" element={<CallDetail />} />
        <Route path="/profile" element={<UpdateProfile />} />
        <Route path="/raise-call" element={<RaiseCall />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ProfileProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/*" element={<AuthenticatedRoutes />} />
      </Routes>
    </BrowserRouter>
  )
}
