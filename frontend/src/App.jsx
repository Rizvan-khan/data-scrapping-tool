import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from './Main-Panel/layouts/AdminLayout';
import Home from './Home';
import Dashboard from './pages/Admin/AdminDashboard'; // Jo dashboard page humne banaya tha

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />

        {/* Admin Routes (Nested) */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* path="/admin" par Dashboard dikhega */}
          <Route index element={<Dashboard />} /> 
          
          {/* Kal ko agar aap users page banate hain toh wo aise aayega:
              path="/admin/users" 
          <Route path="users" element={<Users />} /> 
          */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;