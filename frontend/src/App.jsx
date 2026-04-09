import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from './Main-Panel/layouts/AdminLayout';
import Home from './Home';
import Dashboard from './pages/Admin/AdminDashboard';
import Create from './pages/Admin/CreateData';
import SearchData from './pages/Admin/SearchResult';
import ProtectedRoute from './routes/ProtectedRoutes';
import Login from './pages/Login';
import Register from './pages/Register';



function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>

            <Route index element={<Dashboard />} />
            <Route path="search/data" element={<Create />} />
            <Route path="search/result/data" element={<SearchData />} />

          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;