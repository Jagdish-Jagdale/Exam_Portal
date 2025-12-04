import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { MdAdd, MdClose, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import {
  FiSearch,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import DeleteConfirmModal from "../../components/Admin/DeleteConfirmModal";

const AdminAboutExamPage = () => {
  const [exams, setExams] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    examDate: "",
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExams(items);
    });
    return () => unsub();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const ellipsis = (text, max) => {
    const s = String(text || "");
    return s.length > max ? s.slice(0, max) + "..." : s;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.description.trim() || !form.examDate) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      if (modalType === "edit" && current?.id) {
        const ref = doc(db, "exams", current.id);
        await updateDoc(ref, {
          title: form.title.trim(),
          description: form.description.trim(),
          examDate: form.examDate,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "exams"), {
          title: form.title.trim(),
          description: form.description.trim(),
          examDate: form.examDate,
          createdAt: Timestamp.now(),
        });
      }
      setOpen(false);
      setForm({ title: "", description: "", examDate: "" });
      setCurrent(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save exam.");
    } finally {
      setLoading(false);
    }
  };

  const openDelete = (exam) => {
    setToDelete(exam);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "exams", toDelete.id));
      setDeleteOpen(false);
      setToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete exam");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setToDelete(null);
  };

  const openCreate = () => {
    setModalType("create");
    setCurrent(null);
    setForm({ title: "", description: "", examDate: "" });
    setOpen(true);
  };

  const openEdit = (exam) => {
    setModalType("edit");
    setCurrent(exam);
    setForm({
      title: exam.title || "",
      description: exam.description || "",
      examDate: exam.examDate || "",
    });
    setOpen(true);
  };

  const openPreview = (exam) => {
    setModalType("preview");
    setCurrent(exam);
    setOpen(true);
  };

  const formatDate = (d) => {
    try {
      if (!d) return "";
      let dt = new Date(d);
      if (isNaN(dt)) {
        const [y, m, day] = String(d).split("-");
        dt = new Date(Number(y), Number(m) - 1, Number(day));
      }
      if (isNaN(dt)) return "";
      const day = String(dt.getDate()).padStart(2, "0");
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const year = dt.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  const getExamStatus = (d) => {
    try {
      if (!d) return { label: "", classes: "" };
      let t;
      const dt = new Date(d);
      if (!isNaN(dt)) {
        t = dt.getTime();
      } else {
        const [y, m, day] = String(d).split("-");
        t = new Date(Number(y), Number(m) - 1, Number(day)).getTime();
      }
      if (!t || isNaN(t)) return { label: "", classes: "" };
      const now = new Date();
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      const diffDays = Math.round((t - start) / 86400000);
      if (diffDays === 0)
        return {
          label: "Today",
          classes: "bg-blue-50 text-blue-700 ring-blue-200",
        };
      if (diffDays > 0)
        return {
          label: `In ${diffDays} day${diffDays === 1 ? "" : "s"}`,
          classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        };
      return {
        label: "Past",
        classes: "bg-rose-50 text-rose-700 ring-rose-200",
      };
    } catch {
      return { label: "", classes: "" };
    }
  };

  const displayed = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? exams.filter(
          (e) =>
            (e.title || "").toLowerCase().includes(term) ||
            (e.description || "").toLowerCase().includes(term)
        )
      : exams.slice();
    const byTitle = (a, b) => (a.title || "").localeCompare(b.title || "");
    const toDateVal = (v) => {
      if (!v) return 0;
      const dt = new Date(v);
      if (!isNaN(dt)) return dt.getTime();
      const [y, m, d] = String(v).split("-");
      const t = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
      return isNaN(t) ? 0 : t;
    };
    const toCreated = (x) => {
      if (!x?.createdAt) return 0;
      if (typeof x.createdAt?.toDate === "function")
        return x.createdAt.toDate().getTime();
      if (x.createdAt?.seconds) return x.createdAt.seconds * 1000;
      return Number(x.createdAt) || 0;
    };
    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => toCreated(a) - toCreated(b));
        break;
      case "examDateAsc":
        filtered.sort((a, b) => toDateVal(a.examDate) - toDateVal(b.examDate));
        break;
      case "examDateDesc":
        filtered.sort((a, b) => toDateVal(b.examDate) - toDateVal(a.examDate));
        break;
      case "titleAsc":
        filtered.sort(byTitle);
        break;
      case "titleDesc":
        filtered.sort((a, b) => byTitle(b, a));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => toCreated(b) - toCreated(a));
        break;
    }
    return filtered;
  }, [exams, search, sortBy]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(displayed.length / pageSize || 1));
  }, [displayed.length, pageSize]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return displayed.slice(start, start + pageSize);
  }, [displayed, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // Statistics
  const stats = [
    {
      title: "Total Exams",
      value: "12",
      icon: "📝",
      bg: "bg-blue-50",
      color: "text-blue-600",
      gradient: "from-blue-600 to-blue-400",
    },
    {
      title: "Active Exams",
      value: "8",
      icon: "✅",
      bg: "bg-green-50",
      color: "text-green-600",
      gradient: "from-green-600 to-emerald-400",
    },
    {
      title: "Total Students",
      value: "1,248",
      icon: "👥",
      bg: "bg-purple-50",
      color: "text-purple-600",
      gradient: "from-purple-600 to-pink-400",
    },
    {
      title: "Avg. Score",
      value: "72%",
      icon: "📊",
      bg: "bg-orange-50",
      color: "text-orange-600",
      gradient: "from-orange-600 to-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">About Exam</h1>
          <p className="text-gray-600 mt-1">
            Manage exam information and details
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <MdAdd className="h-5 w-5" />
          Add Exam
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
              className={`absolute inset-0 bg-gradient-to-tr ${stat.gradient} translate-x-[-100%] group-hover:translate-x-[0%] transition-transform duration-500`}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 group-hover:text-white transition-colors duration-300">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 ${stat.bg} rounded-lg group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300`}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    )}
                    {index === 3 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exams..."
            className="w-full h-12 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 transition-all focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex items-center gap-2 sm:self-auto self-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-12 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            title="Sort"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="examDateAsc">Date ↑</option>
            <option value="examDateDesc">Date ↓</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-12 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            title="Records per page"
          >
            <option value={10}>10 records</option>
            <option value={25}>25 records</option>
            <option value={30}>30 records</option>
          </select>
          <div className="flex items-center gap-2 ml-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-10 px-3 inline-flex items-center gap-1 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              title="Previous"
            >
              <FiChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-10 px-3 inline-flex items-center gap-1 rounded-lg border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              title="Next"
            >
              <span className="hidden sm:inline">Next</span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {displayed.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            {search.trim()
              ? "No exams match your search."
              : 'No exams yet. Click "Add Exam" to create one.'}
          </div>
        ) : (
          <>
            <div className="flex md:hidden items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-700 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-b border-gray-200 rounded-t-xl px-3 py-2">
              <div className="w-12 text-center">Sr No</div>
              <div className="flex-1 text-left pl-2">Exam</div>
              <div className="w-20 text-center">Actions</div>
            </div>
            <div className="hidden md:flex items-center gap-4 md:gap-6 text-sm font-semibold uppercase tracking-wide text-gray-700 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-b border-gray-200 rounded-t-xl px-4 py-2.5">
              <div className="w-12 text-center">Sr No</div>
              <div className="flex-1 text-left pl-3 md:pl-4">Exam</div>
              <div className="w-40 text-center">Date</div>
              <div className="w-28 text-center">Status</div>
              <div className="w-28 text-center border-l border-gray-200 px-2 sm:px-3">
                Actions
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {paged.map((e, idx) => {
                const s = getExamStatus(e.examDate);
                const globalIdx = (page - 1) * pageSize + idx; // 0-based
                const circleClass = "bg-indigo-100 text-indigo-700";
                return (
                  <div key={e.id} className="px-4 py-3 overflow-hidden">
                    <div className="flex items-center gap-4 md:gap-6 w-full">
                      {/* Sr */}
                      <div className="w-12 flex-shrink-0 flex items-center justify-center">
                        <div
                          className={`w-7 h-7 rounded-full ${circleClass} flex items-center justify-center text-xs sm:text-sm font-semibold leading-none text-center`}
                        >
                          {globalIdx + 1}
                        </div>
                      </div>
                      {/* Exam */}
                      <div className="flex-1 min-w-0 pl-3 md:pl-4 pr-2 sm:pr-4 md:pr-6 lg:pr-10">
                        <h3
                          className="block w-full text-sm sm:text-base font-semibold text-gray-900 truncate max-w-full overflow-hidden"
                          title={e.title}
                        >
                          {ellipsis(e.title, 30)}
                        </h3>
                        <p
                          className="block w-full text-xs sm:text-sm text-gray-600 mt-1 truncate max-w-full overflow-hidden"
                          title={e.description}
                        >
                          {ellipsis(e.description, 70)}
                        </p>
                      </div>
                      {/* Date */}
                      <div className="w-40 flex-shrink-0 hidden md:flex justify-center">
                        <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 whitespace-nowrap">
                          <FiCalendar className="w-3.5 h-3.5" />
                          {formatDate(e.examDate)}
                        </span>
                      </div>
                      {/* Status */}
                      <div className="w-28 flex-shrink-0 hidden md:flex justify-center">
                        {s.label ? (
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ring-1 whitespace-nowrap ${s.classes}`}
                          >
                            {s.label}
                          </span>
                        ) : (
                          <span className="text-xs text-transparent select-none">
                            .
                          </span>
                        )}
                      </div>
                      {/* Actions */}
                      <div className="w-28 flex-shrink-0 flex justify-end pl-4 sm:pl-5 border-l border-gray-200 gap-2">
                        <button
                          onClick={() => openPreview(e)}
                          title="Preview"
                          className="p-1.5 rounded-full border text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm"
                        >
                          <MdVisibility className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(e)}
                          title="Edit"
                          className="p-1.5 rounded-full border text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 shadow-sm"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDelete(e)}
                          title="Delete"
                          className="p-1.5 rounded-full border text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100 shadow-sm"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {modalType === "edit"
                  ? "Edit Exam"
                  : modalType === "preview"
                  ? "Preview Exam"
                  : "Add Exam"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50"
                aria-label="Close"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>
            {modalType === "preview" && current && (
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 break-words min-w-0 flex-1">
                    {current.title}
                  </h3>
                  <div className="flex items-center gap-2 self-start">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 whitespace-nowrap">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {formatDate(current.examDate)}
                    </span>
                    {(() => {
                      const s = getExamStatus(current.examDate);
                      return s.label ? (
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ring-1 whitespace-nowrap ${s.classes}`}
                        >
                          {s.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div className="max-h-32 overflow-y-auto pr-1">
                  <p
                    className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed"
                    style={{ overflowWrap: "anywhere" }}
                  >
                    {current.description}
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {(modalType === "create" || modalType === "edit") && (
              <form onSubmit={onSubmit} className="p-4 space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter exam details"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Exam
                  </label>
                  <input
                    type="date"
                    name="examDate"
                    value={form.examDate}
                    onChange={onChange}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : modalType === "edit"
                      ? "Save Changes"
                      : "Save Exam"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <DeleteConfirmModal
        open={deleteOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${
          toDelete?.title || "this exam"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AdminAboutExamPage;
