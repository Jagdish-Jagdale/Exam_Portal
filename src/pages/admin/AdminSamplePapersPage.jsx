import React, { useState } from "react";

const AdminSamplePapersPage = () => {
  const [samplePapers, setSamplePapers] = useState([
    {
      id: 1,
      title: "Physics Sample Paper 2024 - Set A",
      subject: "Physics",
      year: 2024,
      questions: 50,
      downloads: 324,
      status: "published",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "Mathematics Sample Paper 2024 - Set B",
      subject: "Mathematics",
      year: 2024,
      questions: 45,
      downloads: 567,
      status: "published",
      createdAt: "2024-01-10",
    },
    {
      id: 3,
      title: "Chemistry Sample Paper 2024 - Set A",
      subject: "Chemistry",
      year: 2024,
      questions: 40,
      downloads: 289,
      status: "draft",
      createdAt: "2024-01-08",
    },
  ]);

  // Statistics
  const stats = [
    {
      title: "Total Papers",
      value: "45",
      bg: "bg-blue-50",
      color: "text-blue-600",
      gradient: "from-blue-400 via-blue-600 to-indigo-600",
    },
    {
      title: "Published",
      value: "38",
      bg: "bg-green-50",
      color: "text-green-600",
      gradient: "from-green-400 via-emerald-600 to-teal-600",
    },
    {
      title: "Total Downloads",
      value: "8,456",
      bg: "bg-purple-50",
      color: "text-purple-600",
      gradient: "from-purple-400 via-violet-600 to-indigo-600",
    },
    {
      title: "Avg. Questions",
      value: "48",
      bg: "bg-orange-50",
      color: "text-orange-600",
      gradient: "from-orange-400 via-red-500 to-pink-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Sample Papers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage sample papers for student practice
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Sample Paper
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-white rounded-xl border border-slate-300 p-5 group cursor-pointer"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-[0%] group-hover:translate-y-[0%] transition-transform duration-700`}
            />
            <div
              className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient} group-hover:h-full transition-all duration-500`}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 group-hover:text-white transition-colors duration-300 delay-100">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 group-hover:text-white transition-colors duration-300 delay-150">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 ${stat.bg} rounded-lg group-hover:bg-white/20 group-hover:rotate-[360deg] transition-all duration-700`}
                >
                  <svg
                    className={`w-8 h-8 ${stat.color} group-hover:text-white transition-colors duration-300`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {index === 0 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    )}
                    {index === 1 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                    {index === 2 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    )}
                    {index === 3 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sample Papers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {samplePapers.map((paper) => (
                <tr key={paper.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {paper.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {paper.subject}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {paper.year}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {paper.questions}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {paper.downloads}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        paper.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {paper.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSamplePapersPage;
