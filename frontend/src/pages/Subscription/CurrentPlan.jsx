
import { useState, useEffect } from "react";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function CurrentPlan() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [invoiceMeta, setInvoiceMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "", show: false });
  const [tab, setTab] = useState("overview"); // overview | invoices

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, type = "") => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, invRes] = await Promise.all([
        API.get("/subscriptions/current"),
        API.get("/subscriptions/invoices"),
      ]);
      setSubscription(subRes.data?.data || null);
      setInvoices(invRes.data?.data || []);
      setInvoiceMeta(invRes.data?.meta || {});
    } catch {
      showToast("Failed to load subscription data", "error");
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await API.post("/subscriptions/cancel", {
        reason: cancelReason || null,
      });
      if (res.data.success) {
        showToast(res.data.message || "Subscription cancelled", "success");
        setShowCancelModal(false);
        fetchData();
      } else {
        showToast(res.data.message || "Cancellation failed", "error");
      }
    } catch (e) {
      showToast(e.response?.data?.message || "Something went wrong", "error");
    }
    setCancelLoading(false);
  };

  const statusColor = (status) => {
    switch (status) {
      case "active": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "trialing": return "bg-blue-50 text-blue-700 border-blue-200";
      case "cancelled": return "bg-orange-50 text-orange-700 border-orange-200";
      case "expired": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const invoiceStatusColor = (status) => {
    switch (status) {
      case "paid": return "bg-emerald-50 text-emerald-700";
      case "pending": return "bg-yellow-50 text-yellow-700";
      case "failed": return "bg-red-50 text-red-700";
      default: return "bg-gray-50 text-gray-600";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#888] text-sm">
          <div className="w-5 h-5 border-2 border-[#e0e0e0] border-t-[#1a6cff] rounded-full animate-spin" />
          Loading subscription...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] px-6 py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111] tracking-tight">Subscription</h1>
          <p className="text-sm text-[#888] mt-1">Manage your plan, billing and invoices</p>
        </div>

        {/* No subscription */}
        {!subscription ? (
          <div className="bg-white border border-[#e8e4dd] rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📦
            </div>
            <h2 className="text-lg font-semibold text-[#111] mb-2">No active subscription</h2>
            <p className="text-sm text-[#888] mb-6">Choose a plan to unlock full access</p>
            <button
              onClick={() => navigate("/plans")}
              className="bg-[#1a6cff] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1558d6] transition-all"
            >
              View Plans
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-[#eeece8] p-1 rounded-xl mb-6 w-fit">
              {["overview", "invoices"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize
                    ${tab === t ? "bg-white text-[#111] shadow-sm" : "text-[#777] hover:text-[#111]"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {tab === "overview" && (
              <div className="space-y-4">

                {/* Current Plan Card */}
                <div className="bg-white border border-[#e8e4dd] rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-[#999] font-medium uppercase tracking-wider mb-1">Current Plan</p>
                      <h2 className="text-2xl font-bold text-[#111]">{subscription.plan?.name}</h2>
                      <p className="text-sm text-[#666] mt-1">
                        ${subscription.plan?.price}/mo · {subscription.plan?.billing_cycle}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${statusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#f0ede8]">
                    <div>
                      <p className="text-xs text-[#999] mb-1">Credits / cycle</p>
                      <p className="text-lg font-bold text-[#111]">{subscription.plan?.credits_per_cycle ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#999] mb-1">Days remaining</p>
                      <p className="text-lg font-bold text-[#111]">{subscription.days_remaining ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#999] mb-1">Auto renew</p>
                      <p className="text-lg font-bold text-[#111]">{subscription.auto_renew ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                {/* Dates Card */}
                <div className="bg-white border border-[#e8e4dd] rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-[#111] mb-4">Billing Period</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Started", value: formatDate(subscription.starts_at) },
                      { label: "Renews / Ends", value: formatDate(subscription.ends_at) },
                      { label: "Period Start", value: formatDate(subscription.current_period_start) },
                      { label: "Period End", value: formatDate(subscription.current_period_end) },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#faf9f7] rounded-xl p-4">
                        <p className="text-xs text-[#999] mb-1">{item.label}</p>
                        <p className="text-sm font-semibold text-[#111]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Card */}
                {subscription.plan?.features?.length > 0 && (
                  <div className="bg-white border border-[#e8e4dd] rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-[#111] mb-4">Plan Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {subscription.plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-[#444]">
                          <span className="text-[#1a6cff] text-xs">✓</span>
                          <span className="capitalize">{f.label || f.key?.replace(/_/g, " ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => navigate("/pricing")}
                    className="bg-[#1a6cff] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1558d6] transition-all"
                  >
                    Upgrade Plan
                  </button>
                  {["active", "trialing"].includes(subscription.status) && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="bg-white text-red-500 border border-red-200 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-all"
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* INVOICES TAB */}
            {tab === "invoices" && (
              <div className="bg-white border border-[#e8e4dd] rounded-2xl overflow-hidden">
                {invoices.length === 0 ? (
                  <div className="text-center py-16 text-[#888] text-sm">
                    <div className="text-3xl mb-3">🧾</div>
                    No invoices yet
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#f0ede8] bg-[#faf9f7]">
                        {["Invoice", "Plan", "Amount", "Status", "Date"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-[#999] uppercase tracking-wider px-5 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv, i) => (
                        <tr key={inv.id || i} className="border-b border-[#f8f6f3] last:border-0 hover:bg-[#faf9f7] transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-[#555]">
                            {inv.invoice_number || `#${String(i + 1).padStart(4, "0")}`}
                          </td>
                          <td className="px-5 py-4 text-[#333] font-medium">{inv.plan || "—"}</td>
                          <td className="px-5 py-4 text-[#111] font-semibold">
                            ₹{parseFloat(inv.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${invoiceStatusColor(inv.status)}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-[#888] text-xs">{formatDate(inv.paid_at || inv.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Pagination */}
                {invoiceMeta.last_page > 1 && (
                  <div className="px-5 py-3 border-t border-[#f0ede8] text-xs text-[#888] flex justify-between items-center">
                    <span>Page {invoiceMeta.current_page} of {invoiceMeta.last_page}</span>
                    <span>{invoiceMeta.total} total invoices</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-[#111] mb-1">Cancel Subscription?</h3>
            <p className="text-sm text-[#888] mb-5">
              You'll keep access until <strong>{formatDate(subscription?.ends_at)}</strong>. This cannot be undone.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancelling (optional)"
              rows={3}
              className="w-full border border-[#e0ddd8] rounded-xl px-4 py-3 text-sm text-[#333] placeholder:text-[#bbb] focus:outline-none focus:border-[#1a6cff] resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-[#f5f3f0] text-[#555] py-2.5 rounded-lg text-sm font-medium hover:bg-[#eeece8] transition-all"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-60"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-white text-sm shadow-xl z-50 transition-all
          ${toast.type === "success" ? "bg-[#1a6cff]" : toast.type === "error" ? "bg-red-500" : "bg-[#111]"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}