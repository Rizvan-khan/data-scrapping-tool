import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from './Main-Panel/layouts/AdminLayout';
import Home from './Home';
import Dashboard from './pages/Admin/AdminDashboard';
import Create from './pages/Admin/CreateData';
import SearchData from './pages/Admin/SearchResult';
import ProtectedRoute from './routes/ProtectedRoutes';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/Admin/Profile/UserProfile';
import UpdateProfile from './pages/Admin/Profile/EditProfile';
import ChangePassword from './pages/Admin/Profile/ChangePassword';
import Plans from './pages/Plans/Plans';
import WebLayouts from './Main-Panel/layouts/WebLayouts';
import ComingSoon from './pages/CommingSoon';
import CurrentPlan from './pages/Subscription/CurrentPlan';
import History from './pages/Admin/History';




function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        

          {/* Layout wrapper */}
      <Route element={<WebLayouts />}>
        <Route path="/pricing" element={<Plans />} />
        <Route path="/commingsoon" element={<ComingSoon />} />
      </Route>

        <Route element={<ProtectedRoute />}>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>

            <Route index element={<Dashboard />} />
            <Route path="search/data" element={<Create />} />
            <Route path="search/result/data" element={<SearchData />} />
            <Route path="search/history" element={<History />} />
            <Route path="subscription" element={<CurrentPlan />} />
            <Route path="accounts/profile" element={<UserProfile />} />
            <Route path="accounts/update-profile" element={<UpdateProfile />} />
            <Route path="accounts/change-password" element={<ChangePassword />} />

          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;