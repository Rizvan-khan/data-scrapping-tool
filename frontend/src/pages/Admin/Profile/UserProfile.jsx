import { useEffect, useState } from "react";
import API from '../../../api/api';

import { useNavigate } from "react-router-dom";



export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await API.get("/user/profile");
            const data = res.data?.data || res.data?.user || res.data;
            setUser(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        const fn = user?.first_name || "";
        const ln = user?.last_name || "";
        return ([fn[0], ln[0]].filter(Boolean).join("") || "U").toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-sm">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Your account information</p>
                </div>

                {/* Avatar + Name Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 flex items-center gap-5">
                    {user?.avatar_url || user?.avatar ? (
                        <img
                            src={user.avatar_url || user.avatar}
                            alt="avatar"
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-100"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-semibold ring-2 ring-gray-100">
                            {getInitials()}
                        </div>
                    )}
                    <div>
                        <p className="text-lg font-semibold text-gray-900">
                            {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "—"}
                        </p>
                        <p className="text-sm text-gray-500">{user?.email || "—"}</p>
                        {user?.company_name && (
                            <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                {user.company_name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                    {[
                        { label: "First name", value: user?.first_name },
                        { label: "Last name", value: user?.last_name },
                        { label: "Email", value: user?.email },
                        { label: "Phone", value: user?.phone },
                        { label: "Gender", value: user?.gender },
                        { label: "Address", value: user?.address },
                        { label: "Company", value: user?.company_name },
                        { label: "Country", value: user?.country },
                        { label: "Bio", value: user?.bio },
                    ].map(({ label, value }) =>
                        value ? (
                            <div key={label} className="flex items-start px-6 py-3.5">
                                <span className="w-32 text-xs font-medium text-gray-400 uppercase tracking-wide pt-0.5 shrink-0">
                                    {label}
                                </span>
                                <span className="text-sm text-gray-800">{value}</span>
                            </div>
                        ) : null
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-3 mt-3">
                    <button
                        onClick={() => navigate("/admin/accounts/update-profile")}
                        className="flex-1 text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                    >
                        Edit Profile
                    </button>

                    <button
                        onClick={() => navigate("/admin/accounts/change-password")}
                        className="flex-1 text-center py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium transition-colors"
                    >
                        Change Password
                    </button>
                </div>

            </div>
        </div>
    );
}