import React, { useState } from "react";

const Banners = () => {
  const [banners, setBanners] = useState([
    {
      id: 1,
      title: "Summer Enrollment Open",
      description: "Register now for summer batch 2024",
      imageUrl:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop",
      isActive: true,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      title: "New Course Launch",
      description: "Advanced Mathematics program starting soon",
      imageUrl:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop",
      isActive: true,
      createdAt: "2024-01-10",
    },
    {
      id: 3,
      title: "Exam Schedule Released",
      description: "Check your exam dates and prepare accordingly",
      imageUrl:
        "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=200&fit=crop",
      isActive: false,
      createdAt: "2024-01-05",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleAddBanner = () => {
    setShowAddModal(true);
  };

  const handleToggleActive = (id) => {
    setBanners(
      banners.map((banner) =>
        banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setBanners(banners.filter((banner) => banner.id !== id));
    }
  };

  const handleImageClick = (imageUrl, title) => {
    setSelectedImage({ url: imageUrl, title: title });
  };

  const handleCloseImage = () => {
    setSelectedImage(null);
  };

  // Statistics
  const totalBanners = banners.length;
  const activeBanners = banners.filter((b) => b.isActive).length;
  const inactiveBanners = banners.filter((b) => !b.isActive).length;

  // Filter and sort banners
  const filteredBanners = banners
    .filter((banner) => {
      const matchesSearch =
        banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ||
        (filterStatus === "active" && banner.isActive) ||
        (filterStatus === "inactive" && !banner.isActive);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Banners Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage promotional banners displayed on the portal
          </p>
        </div>
        <button
          onClick={handleAddBanner}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
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
          Add Banner
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="w-full p-5 rounded-xl border border-slate-300 relative overflow-hidden group bg-white cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />
          <svg
            className="absolute z-10 -top-12 -right-12 text-9xl text-slate-100 group-hover:text-indigo-400 group-hover:rotate-12 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 group-hover:text-indigo-200 transition-colors duration-300">
                Total Banners
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                {totalBanners}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <svg
                className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-full p-5 rounded-xl border border-slate-300 relative overflow-hidden group bg-white cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />
          <svg
            className="absolute z-10 -top-12 -right-12 text-9xl text-slate-100 group-hover:text-green-400 group-hover:rotate-12 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 group-hover:text-green-200 transition-colors duration-300">
                Active Banners
              </p>
              <p className="mt-2 text-3xl font-semibold text-green-600 group-hover:text-white transition-colors duration-300">
                {activeBanners}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <svg
                className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-full p-5 rounded-xl border border-slate-300 relative overflow-hidden group bg-white cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-slate-600 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />
          <svg
            className="absolute z-10 -top-12 -right-12 text-9xl text-slate-100 group-hover:text-gray-400 group-hover:rotate-12 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 group-hover:text-gray-200 transition-colors duration-300">
                Inactive Banners
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-600 group-hover:text-white transition-colors duration-300">
                {inactiveBanners}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-white/20 transition-all duration-300">
              <svg
                className="w-8 h-8 text-gray-600 group-hover:text-white transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search banners by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">
              Filter:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">
              Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || filterStatus !== "all") && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-indigo-900"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {filterStatus !== "all" && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1">
                Status: {filterStatus}
                <button
                  onClick={() => setFilterStatus("all")}
                  className="hover:text-indigo-900"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredBanners.length}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{totalBanners}</span>{" "}
          banners
        </p>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredBanners.map((banner) => (
          <div
            key={banner.id}
            className="w-full rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex flex-col md:flex-row">
              {/* Banner Image - Left */}
              <div
                className="md:w-100 h-32 md:h-32 bg-gradient-to-br from-indigo-100 to-purple-100 flex-shrink-0 cursor-pointer group"
                onClick={() => handleImageClick(banner.imageUrl, banner.title)}
              >
                <div className="relative w-full h-full">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <svg class="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-20">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Banner Details - Middle */}
              <div className="flex-1 p-7 ">
                <div className="flex items-start gap-5 mb-1">
                  <h3 className="text-base font-semibold text-gray-800 flex-1">
                    {banner.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      banner.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                  {banner.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>
                      {new Date(banner.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
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
                    <span>1,234 views</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Right */}
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => handleToggleActive(banner.id)}
                  className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                    banner.isActive
                      ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                      : "bg-green-100 hover:bg-green-200 text-green-700"
                  }`}
                  title={
                    banner.isActive ? "Deactivate Banner" : "Activate Banner"
                  }
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {banner.isActive ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>

                <button
                  className="p-2.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 hover:scale-110 transition-all duration-200"
                  title="Edit Banner"
                >
                  <svg
                    className="w-4 h-4"
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

                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 hover:scale-110 transition-all duration-200"
                  title="Delete Banner"
                >
                  <svg
                    className="w-4 h-4"
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
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBanners.length === 0 && searchQuery && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-800">
            No banners found
          </h3>
          <p className="mt-2 text-gray-600">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {banners.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-800">
            No banners yet
          </h3>
          <p className="mt-2 text-gray-600">
            Get started by creating your first banner
          </p>
          <button
            onClick={handleAddBanner}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Banner
          </button>
        </div>
      )}

      {/* Add Banner Modal - You can implement this as needed */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Add New Banner
            </h2>
            <p className="text-gray-600 mb-4">
              Banner creation form will be implemented here
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Full Width Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Blurred Background with Vignette Effect */}
          <div
            className="absolute inset-0 bg-black bg-opacity-70"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background:
                "radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* Back Button */}
          <button
            onClick={handleCloseImage}
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 text-white rounded-md transition-all duration-200 hover:opacity-80 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Image Container */}
          <div className="max-w-6xl w-full relative z-10">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            {/* Image Title */}
            <div className="mt-3 text-center">
              <h3 className="text-lg font-semibold text-white drop-shadow-lg">
                {selectedImage.title}
              </h3>
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0"
            onClick={handleCloseImage}
            style={{ zIndex: -1 }}
          />
        </div>
      )}
    </div>
  );
};

export default Banners;
