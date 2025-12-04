import React from "react";

const Dashboard = () => {
  const kpis = [
    {
      title: "Total Users",
      value: "1,248",
      delta: "+4.2%",
      tone: "text-emerald-600",
      bg: "bg-emerald-50",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Total Exams",
      value: "36",
      delta: "+1.1%",
      tone: "text-blue-600",
      bg: "bg-blue-50",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Exam Attempts",
      value: "8,745",
      delta: "+12.4%",
      tone: "text-indigo-600",
      bg: "bg-indigo-50",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      title: "Pass Rate",
      value: "68%",
      delta: "+0.8%",
      tone: "text-purple-600",
      bg: "bg-purple-50",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const lineData = [10, 14, 12, 18, 22, 19, 26, 31, 29, 35, 38, 42];
  const barData = [45, 30, 55, 20, 35, 60, 25];

  const maxLine = Math.max(...lineData) || 1;
  const linePath = lineData
    .map((v, i) => {
      const x = (i * (100 / (lineData.length - 1))).toFixed(2);
      const y = (100 - (v / maxLine) * 100).toFixed(2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of platform performance and activity
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((k) => (
          <div
            key={k.title}
            className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-slate-300 p-5 group cursor-pointer"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${k.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 group-hover:text-white transition-colors duration-300">
                  {k.title}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${k.bg} ${k.tone} group-hover:bg-white/20 group-hover:text-white transition-colors duration-300`}
                >
                  {k.delta}
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                {k.value}
              </p>
              <div className="mt-4 h-2 rounded-full bg-gray-100 group-hover:bg-white/20 transition-colors duration-300">
                <div
                  className={`h-2 rounded-full ${k.tone.replace(
                    "text-",
                    "bg-"
                  )} group-hover:bg-white transition-all duration-300 group-hover:w-full`}
                  style={{ width: "70%" }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">
              Monthly New Users
            </h3>
            <span className="text-sm text-gray-500">Last 12 months</span>
          </div>
          <div className="mt-4">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-48"
            >
              <defs>
                <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${linePath}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
              />
              <path
                d={`${linePath} L 100 100 L 0 100 Z`}
                fill="url(#lineGrad)"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-800">
              Weekly Exam Attempts
            </h3>
            <span className="text-sm text-gray-500">This month</span>
          </div>
          <div className="mt-6 grid grid-cols-7 items-end gap-2 h-48">
            {barData.map((v, i) => {
              const max = Math.max(...barData) || 1;
              const h = Math.max(6, Math.round((v / max) * 100));
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-md"
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] text-gray-500">
                    {["S", "M", "T", "W", "T", "F", "S"][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tables/Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 xl:col-span-2">
          <h3 className="text-lg font-medium text-gray-800">
            Recent Registrations
          </h3>
          <ul className="mt-4 divide-y divide-gray-100">
            {[
              {
                name: "Ananya Sharma",
                email: "ananya@example.com",
                time: "2h ago",
              },
              {
                name: "Rohit Patil",
                email: "rohit@example.com",
                time: "4h ago",
              },
              { name: "Neha Gupta", email: "neha@example.com", time: "6h ago" },
              {
                name: "Karan Joshi",
                email: "karan@example.com",
                time: "yesterday",
              },
            ].map((u) => (
              <li
                key={u.email}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <span className="text-xs text-gray-500">{u.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-medium text-gray-800">Activity</h3>
          <div className="mt-4 space-y-4">
            {[
              { t: "Syllabus updated for Physics", ts: "Today • 09:20" },
              { t: "New sample paper uploaded", ts: "Yesterday • 18:05" },
              { t: "Important dates revised", ts: "2 days ago • 14:12" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                <div>
                  <p className="text-sm text-gray-800">{a.t}</p>
                  <p className="text-xs text-gray-500">{a.ts}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
