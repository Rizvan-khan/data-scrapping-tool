import { useState, useEffect } from "react";
import API from '../../api/api' // tumhara axios instance
import { useNavigate } from "react-router-dom";

const FALLBACK_PLANS = [
  {
    id: null,
    name: "Free",
    slug: "free",
    price_monthly: 0,
    price_yearly: 0,
    features: [
      { label: "$5 usage credits", included: true },
      { label: "Community support", included: true },
      { label: "Basic limits", included: true },
      { label: "Store discount", included: false },
    ],
    popular: false,
  },
  {
    id: null,
    name: "Starter",
    slug: "starter",
    price_monthly: 29,
    price_yearly: 26,
    features: [
      { label: "$29 credits included", included: true },
      { label: "Chat support", included: true },
      { label: "Better limits", included: true },
      { label: "Bronze discount", included: true },
    ],
    popular: false,
  },
  {
    id: null,
    name: "Scale",
    slug: "scale",
    price_monthly: 199,
    price_yearly: 179,
    features: [
      { label: "$199 credits included", included: true },
      { label: "Priority chat support", included: true },
      { label: "High concurrency", included: true },
      { label: "Silver discount", included: true },
    ],
    popular: true,
  },
  {
    id: null,
    name: "Business",
    slug: "business",
    price_monthly: 999,
    price_yearly: 899,
    features: [
      { label: "$999 credits included", included: true },
      { label: "Dedicated manager", included: true },
      { label: "Max performance", included: true },
      { label: "Gold discount", included: true },
    ],
    popular: false,
  },
];

function mapApiPlans(apiPlans) {
  return apiPlans.map((p, i) => {
    const features = (p.features || []).map((f) => ({
      label: f.feature_key?.replace(/_/g, " ") || f.label || "",
      included: f.feature_value !== "false" && f.feature_value !== "0",
    }));
    if (!features.length) {
      features.push(
        { label: `$${p.price} credits included`, included: true },
        { label: "Standard support", included: true }
      );
    }
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price_monthly: parseFloat(p.price) || 0,
      price_yearly: Math.round(parseFloat(p.price) * 0.9) || 0,
      features,
      popular: i === 2,
    };
  });
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "", show: false });

const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const showToast = (msg, type = "") => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

 const fetchPlans = async () => {
  setLoading(true);
  try {
      const res = await fetch("http://127.0.0.1:8000/api/plans");
      const json = await res.json();
      const raw = json?.data || json?.plans || json || [];
      setPlans(Array.isArray(raw) && raw.length ? mapApiPlans(raw) : FALLBACK_PLANS);
    } catch {
      setPlans(FALLBACK_PLANS);
    }

  // ✅ Sirf tab call karo jab logged in ho
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const res = await API.get("/subscriptions/current");
      setCurrentPlanId(res.data?.data?.plan?.id || null);
    } catch {
      // ignore
    }
  }

  setLoading(false);
};

  const handleSubscribe = async (plan) => {

 const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const price = yearly ? plan.price_yearly : plan.price_monthly;
    const isFree = price === 0;

    if (isFree) {
      showToast("Free plan already active!", "success");
      return;
    }

    showToast("Creating order...");
    try {
      const res = await API.post("/subscriptions/create-order", {
        plan_id: plan.id,
        billing_cycle: yearly ? "yearly" : "monthly",
      });

      if (!res.data.success) throw new Error(res.data.message || "Order failed");

      openRazorpay(res.data.data, plan);
    } catch (e) {
      showToast(e.response?.data?.message || e.message || "Something went wrong", "error");
    }
  };

  const openRazorpay = (orderData, plan) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SjaDgFUPnAwqZ6",
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      order_id: orderData.razorpay_order_id,
      name: "Data Scraper Tool",
      description: `${plan.name} Plan`,
      handler: async (response) => {
        showToast("Verifying payment...");
        try {
          const res = await API.post("/subscriptions/verify-payment", {
             plan_id: plan.id,                              // ✅ add karo
      billing_cycle: yearly ? "yearly" : "monthly",  // ✅ add karo
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,

             


          });
          if (res.data.success) {
            showToast("Subscription activated! 🎉", "success");
            fetchPlans();
          } else {
            showToast(res.data.message || "Verification failed", "error");
          }
        } catch {
          showToast("Verification error", "error");
        }
      },
      theme: { color: "#1a6cff" },
    };
    new window.Razorpay(options).open();
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] px-6 py-16 font-sans">

      {/* Heading */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-[#111]">
          Flexible plan + pay as you go
        </h1>
        <p className="text-[#666] mt-3 text-sm">
          Choose the plan that fits your workflow. Upgrade or cancel anytime.
        </p>

        {/* Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="bg-[#e8e5e0] rounded-full p-1 flex gap-1">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !yearly ? "bg-white text-[#111] shadow-sm" : "text-[#666]"
              }`}
            >
              Bill monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                yearly ? "bg-white text-[#111] shadow-sm" : "text-[#666]"
              }`}
            >
              Bill annually
              <span className="bg-[#111] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                -10%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="mt-10 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#888] text-sm gap-3">
            <div className="w-5 h-5 border-2 border-[#e0e0e0] border-t-[#1a6cff] rounded-full animate-spin" />
            Loading plans...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#e0ddd8] rounded-xl overflow-hidden">
            {plans.map((plan, i) => {
              const price = yearly ? plan.price_yearly : plan.price_monthly;
              const isFree = price === 0;
              const isCurrent = plan.id && plan.id === currentPlanId;

              return (
                <div
                  key={i}
                  className={`relative p-6 flex flex-col border-r border-[#e0ddd8] last:border-r-0
                    ${plan.popular ? "bg-[#1a6cff] text-white" : "bg-white"}`}
                >
                  {/* Plan Name */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-sm font-semibold ${plan.popular ? "text-white" : "text-[#111]"}`}>
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                        ${plan.popular ? "bg-white/20 text-white" : "bg-blue-50 text-[#1a6cff]"}`}>
                        Current
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className={`text-4xl font-bold leading-none ${plan.popular ? "text-white" : "text-[#111]"}`}>
                    ${price}
                  </div>
                  <div className={`text-xs mt-1 ${plan.popular ? "text-white/70" : "text-[#999]"}`}>
                    {isFree ? "Free forever" : "/ month + pay as you go"}
                  </div>

                  {/* Credits note */}
                  <div className={`text-xs mt-3 leading-relaxed min-h-[36px] ${plan.popular ? "text-white/80" : "text-[#555]"}`}>
                    ${price} to spend on your usage credits
                    {yearly && !isFree ? " (billed yearly)" : ""}
                  </div>

                  {/* Divider */}
                  <div className={`my-4 h-px ${plan.popular ? "bg-white/20" : "bg-[#ece9e3]"}`} />

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs">
                        <span className={
                          f.included
                            ? plan.popular ? "text-white" : "text-[#1a6cff]"
                            : plan.popular ? "text-white/30" : "text-[#ccc]"
                        }>
                          {f.included ? "✓" : "✗"}
                        </span>
                        <span className={plan.popular ? "text-white/90" : "text-[#444]"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <button
                    disabled={isCurrent}
                    onClick={() => handleSubscribe(plan)}
                    className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium border transition-all
                      ${plan.popular
                        ? "bg-white text-[#1a6cff] border-transparent hover:bg-blue-50"
                        : "bg-white text-[#111] border-[#d0ccc5] hover:border-[#111]"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isCurrent ? "Current Plan" : isFree ? "Start for free" : "Upgrade now"}
                  </button>

                  {isFree && (
                    <p className={`text-center text-[10px] mt-2 ${plan.popular ? "text-white/50" : "text-[#aaa]"}`}>
                      No credit card required
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Plan */}
      <div className="mt-14 text-center text-[#888] text-sm">
        <p>Need a custom plan?</p>
        <button className="mt-3 bg-[#111] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#333] transition-all">
          Contact Sales
        </button>
      </div>

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg text-white text-sm shadow-lg z-50 transition-all
            ${toast.type === "success" ? "bg-[#1a6cff]" : toast.type === "error" ? "bg-red-500" : "bg-[#111]"}`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}