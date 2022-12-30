import Signup from "./auth/Signup";
import AuthProvider from "../contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./auth/Profile";
import Login from "./auth/Login";
import ForgotPassword from "./auth/ForgotPassword";
import UpdateProfile from "./auth/UpdateProfile";
import Dashboard from "./drive/Dashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Drive */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/folder/:folderId" element={<Dashboard />} />

          {/* Profile */}
          <Route path="/user" element={<Profile />} />
          <Route path="/update-user" element={<UpdateProfile />} />

          {/* Authentication */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
