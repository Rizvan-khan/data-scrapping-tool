import { useState } from "react";
import API from '../../../api/api';

export default function ChangePassword() {
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [show, setShow] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const map = [
      { label: "", color: "" },
      { label: "Weak", color: "bg-red-400" },
      { label: "Fair", color: "bg-yellow-400" },
      { label: "Good", color: "bg-blue-400" },
      { label: "Strong", color: "bg-green-500" },
    ];
    return { score, ...map[score] };
  };

  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side check
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ["Passwords do not match."] });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/user/change-password", form);
      showToast(res.data?.message || "Password changed successfully!", "success");
      setForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data?.errors || {});
      } else {
        showToast(err.response?.data?.message || "Something went wrong.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3500);
  };

  const EyeIcon = ({ open }) => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      {open ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
        </>
      )}
    </svg>
  );

  const PasswordField = ({ name, label, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show[name] ? "text" : "password"}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition
            ${errors[name] ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}
        />
        <button
          type="button"
          onClick={() => toggleShow(name)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <EyeIcon open={show[name]} />
        </button>
      </div>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name][0]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Toast */}
        {toast.show && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg
              ${toast.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
              }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-500 mt-1">Keep your account secure</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Password Settings
            </p>

            {/* Current Password */}
            <PasswordField
              name="current_password"
              label="Current password"
              placeholder="Enter current password"
            />

            <div className="border-t border-gray-100 pt-4 space-y-4">

              {/* New Password */}
              <PasswordField
                name="password"
                label="New password"
                placeholder="Enter new password"
              />

              {/* Strength Bar */}
              {form.password && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          i <= strength.score ? strength.color : "bg-gray-100"
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs text-gray-500">
                      Password strength:{" "}
                      <span className={`font-medium ${
                        strength.score <= 1 ? "text-red-500" :
                        strength.score === 2 ? "text-yellow-500" :
                        strength.score === 3 ? "text-blue-500" : "text-green-600"
                      }`}>{strength.label}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Hints */}
              <ul className="text-xs text-gray-400 space-y-0.5 list-none pl-0">
                {[
                  { rule: form.password.length >= 8, text: "At least 8 characters" },
                  { rule: /[A-Z]/.test(form.password), text: "One uppercase letter" },
                  { rule: /[0-9]/.test(form.password), text: "One number" },
                  { rule: /[^A-Za-z0-9]/.test(form.password), text: "One special character" },
                ].map(({ rule, text }) => (
                  <li key={text} className={`flex items-center gap-1.5 ${rule ? "text-green-600" : ""}`}>
                    <span>{rule ? "✓" : "·"}</span> {text}
                  </li>
                ))}
              </ul>

              {/* Confirm Password */}
              <PasswordField
                name="password_confirmation"
                label="Confirm new password"
                placeholder="Re-enter new password"
              />

            </div>

          </div>

          {/* Submit */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setForm({ current_password: "", password: "", password_confirmation: "" });
                setErrors({});
              }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}