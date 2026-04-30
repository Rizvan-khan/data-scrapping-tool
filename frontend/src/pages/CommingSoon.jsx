import { useEffect, useState } from "react";

export default function ComingSoon() {
  const launchDate = new Date("2026-06-01T00:00:00").getTime();

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date().getTime();
    const diff = launchDate - now;

    return {
      days: Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0),
      hours: Math.max(Math.floor((diff / (1000 * 60 * 60)) % 24), 0),
      minutes: Math.max(Math.floor((diff / (1000 * 60)) % 60), 0),
      seconds: Math.max(Math.floor((diff / 1000) % 60), 0),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Glow Background */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/30 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-[400px] h-[400px] bg-purple-500/30 blur-3xl rounded-full bottom-10 right-10"></div>

      {/* Content */}
      <div className="text-center max-w-2xl z-10">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Coming Soon 🚀
        </h1>

        <p className="text-slate-400 mb-8">
          We’re working hard to launch something amazing. Stay tuned!
        </p>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {Object.entries(timeLeft).map(([label, value]) => (
            <div
              key={label}
              className="bg-slate-900 p-4 rounded-xl shadow-lg"
            >
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-slate-400 uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Email Subscribe */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none"
          />
          <button className="bg-indigo-500 px-6 py-2 rounded-lg hover:bg-indigo-600 transition">
            Notify Me
          </button>
        </div>
      </div>
    </div>
  );
}