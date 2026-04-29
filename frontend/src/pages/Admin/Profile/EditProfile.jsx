import { useEffect, useState, useRef } from "react";
import API from '../../../api/api';

export default function UpdateProfile() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    bio: "",
    address: "",
    company_name: "",
    country: "",
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });
  const fileRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get("/user/profile");
      const u = res.data?.data || res.data?.user || res.data;
      setForm({
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        email: u.email || "",
        phone: u.phone || "",
        gender: u.gender || "",
        bio: u.bio || "",
        address: u.address || "",
        company_name: u.company_name || "",
        country: u.country || "",
      });
      if (u.avatar_url || u.avatar) setAvatarPreview(u.avatar_url || u.avatar);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);

    // Upload to /user/avatar
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append("avatar", file);
    try {
      await API.post("/user/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Photo updated!", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Avatar upload failed.", "error");
      setAvatarPreview(null);
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const res = await API.put("/user/profile", form);
      showToast(res.data?.message || "Profile updated successfully!", "success");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data?.errors || {});
      } else {
        showToast(err.response?.data?.message || "Something went wrong.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3500);
  };

  const getInitials = () => {
    return (
      [(form.first_name || "")[0], (form.last_name || "")[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "U"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Toast */}
        {toast.show && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all
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
          <h1 className="text-2xl font-semibold text-gray-900">Update Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Edit your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Avatar Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className={`w-20 h-20 rounded-full object-cover ring-2 ring-gray-100 ${avatarUploading ? "opacity-50" : ""}`}
                />
              ) : (
                <div className={`w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-semibold ${avatarUploading ? "opacity-50" : ""}`}>
                  {getInitials()}
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z" />
                </svg>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {[form.first_name, form.last_name].filter(Boolean).join(" ") || "Your Name"}
              </p>
              <p className="text-sm text-gray-500">{form.email || "your@email.com"}</p>
              <p className="text-xs text-gray-400 mt-1">Click pencil icon to change photo</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Personal Information
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Arjun"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                    ${errors.first_name ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}
                />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name[0]}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Sharma"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                    ${errors.last_name ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}
                />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name[0]}</p>}
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="arjun@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                    ${errors.email ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email[0]}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                    ${errors.phone ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone[0]}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not">Prefer not to say</option>
                </select>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company name</label>
                <input
                  type="text"
                  name="company_name"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="Acme Pvt Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="India"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="12, MG Road, Sambhal, UP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                  maxLength={200}
                  placeholder="Tell us a bit about yourself..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{form.bio.length}/200</p>
              </div>

            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={fetchProfile}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}