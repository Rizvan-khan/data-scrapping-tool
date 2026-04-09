import { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom"; // Link import kiya redirect ke liye

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/register", form);
      localStorage.setItem("token", res.data.token);
      
      showMessage("Account Created Successfully! 🔥", "success");
      
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration Failed!";
      showMessage(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        
        {/* Alert Messages */}
        {message.text && (
          <div className={`absolute top-0 left-0 w-full p-3 text-center text-sm font-semibold transition-all z-10 ${
            message.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}>
            {message.text}
          </div>
        )}

        <div className="text-center mt-4 mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Join us today! It only takes a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all mt-2 ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        {/* Redirect to Login */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account? 
          <Link to="/login" className="text-blue-600 font-bold hover:underline ml-1">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}