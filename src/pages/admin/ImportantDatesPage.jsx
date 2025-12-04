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

const AdminImportantDatesPage = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("create");
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    totalQuestions: "",
    totalMarks: "",
    passingMarks: "",
    passingPercent: "",
    totalRounds: "",
    eligibility: "",
  });

  useEffect(() => {
    const q = query(
      collection(db, "importantDates"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const ellipsis = (t, m) => {
    const s = String(t || "");
    return s.length > m ? s.slice(0, m) + "..." : s;
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

  const getStatus = (sDate, eDate) => {
    try {
      const now = Date.now();
      const s = sDate ? new Date(sDate).getTime() : NaN;
      const e = eDate ? new Date(eDate).getTime() : NaN;
      if (!isNaN(s) && now < s)
        return {
          label: "Upcoming",
          classes: "bg-amber-50 text-amber-700 ring-amber-200",
        };
      if (!isNaN(s) && !isNaN(e) && now >= s && now <= e)
        return {
          label: "Ongoing",
          classes: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        };
      if (!isNaN(e) && now > e)
        return {
          label: "Past",
          classes: "bg-rose-50 text-rose-700 ring-rose-200",
        };
      return { label: "", classes: "" };
    } catch {
      return { label: "", classes: "" };
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      setError("Title, Start Date and End Date are required.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        totalQuestions: Number(form.totalQuestions) || 0,
        totalMarks: Number(form.totalMarks) || 0,
        passingMarks: Number(form.passingMarks) || 0,
        passingPercent: Number(form.passingPercent) || 0,
        totalRounds: Number(form.totalRounds) || 0,
        eligibility: form.eligibility.trim(),
      };
      if (modalType === "edit" && current?.id) {
        await updateDoc(doc(db, "importantDates", current.id), {
          ...payload,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "importantDates"), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }
      setOpen(false);
      setForm({
        title: "",
        startDate: "",
        endDate: "",
        totalQuestions: "",
        totalMarks: "",
        passingMarks: "",
        passingPercent: "",
        totalRounds: "",
        eligibility: "",
      });
      setCurrent(null);
    } catch (err) {
      console.error(err);
      setError("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalType("create");
    setCurrent(null);
    setForm({
      title: "",
      startDate: "",
      endDate: "",
      totalQuestions: "",
      totalMarks: "",
      passingMarks: "",
      passingPercent: "",
      totalRounds: "",
      eligibility: "",
    });
    setOpen(true);
  };

  const openEdit = (item) => {
    setModalType("edit");
    setCurrent(item);
    setForm({
      title: item.title || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      totalQuestions: String(item.totalQuestions ?? ""),
      totalMarks: String(item.totalMarks ?? ""),
      passingMarks: String(item.passingMarks ?? ""),
      passingPercent: String(item.passingPercent ?? ""),
      totalRounds: String(item.totalRounds ?? ""),
      eligibility: item.eligibility || "",
    });
    setOpen(true);
  };

  const openPreview = (item) => {
    setModalType("preview");
    setCurrent(item);
    setOpen(true);
  };

  const openDelete = (item) => {
    setToDelete(item);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!toDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "importantDates", toDelete.id));
      setDeleteOpen(false);
      setToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete record");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteOpen(false);
    setToDelete(null);
  };

  const displayed = useMemo(() => {
    const term = search.trim().toLowerCase();
    const arr = term
      ? items.filter(
          (e) =>
            (e.title || "").toLowerCase().includes(term) ||
            (e.eligibility || "").toLowerCase().includes(term)
        )
      : items.slice();
    const toCreated = (x) =>
      x?.createdAt?.toDate
        ? x.createdAt.toDate().getTime()
        : x?.createdAt?.seconds
        ? x.createdAt.seconds * 1000
        : Number(x?.createdAt) || 0;
    arr.sort((a, b) =>
      sortBy === "oldest"
        ? toCreated(a) - toCreated(b)
        : toCreated(b) - toCreated(a)
    );
    return arr;
  }, [items, search, sortBy]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(displayed.length / pageSize || 1)),
    [displayed.length, pageSize]
  );
  const paged = useMemo(
    () =>
      displayed.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
    [displayed, page, pageSize]
  );
  useEffect(() => setPage(1), [search, sortBy, pageSize]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  // Statistics
  const stats = [
    {
      title: "Total Events",
      value: "24",
      icon: "📅",
      bg: "bg-indigo-50",
      color: "text-indigo-600",
      gradient: "from-indigo-600 via-purple-600 to-pink-600",
    },
    {
      title: "Upcoming",
      value: "8",
      icon: "⏰",
      bg: "bg-blue-50",
      color: "text-blue-600",
      gradient: "from-blue-600 via-cyan-600 to-teal-600",
    },
    {
      title: "This Month",
      value: "5",
      icon: "📌",
      bg: "bg-purple-50",
      color: "text-purple-600",
      gradient: "from-purple-600 via-fuchsia-600 to-pink-600",
    },
    {
      title: "Completed",
      value: "16",
      icon: "✔️",
      bg: "bg-green-50",
      color: "text-green-600",
      gradient: "from-green-600 via-emerald-600 to-teal-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Important Dates
          </h1>
          <p className="text-gray-600 mt-1">
            Manage exam schedules and important dates
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <MdAdd className="h-5 w-5" /> Add Record
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
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} scale-0 group-hover:scale-100 transition-transform duration-500 origin-center`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-tl ${stat.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 group-hover:text-white transition-colors duration-300">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 group-hover:text-white group-hover:scale-110 transition-all duration-300 inline-block">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 ${stat.bg} rounded-lg group-hover:bg-white/20 group-hover:rotate-12 transition-all duration-300`}
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    )}
                    {index === 1 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                    {index === 2 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    )}
                    {index === 3 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
            placeholder="Search records..."
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
              ? "No records match your search."
              : 'No records yet. Click "Add Record" to create one.'}
          </div>
        ) : (
          <>
            <div className="flex md:hidden items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-700 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-b border-gray-200 rounded-t-xl px-3 py-2">
              <div className="w-12 text-center">Sr No</div>
              <div className="flex-1 text-left pl-2">Title</div>
              <div className="w-20 text-center">Actions</div>
            </div>
            <div className="hidden md:flex items-center gap-4 md:gap-6 text-xs font-semibold uppercase tracking-wide text-gray-700 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-b border-gray-200 rounded-t-xl px-4 py-2.5">
              <div className="w-12 text-center">Sr No</div>
              <div className="flex-1 text-left pl-3 md:pl-4">
                Title & Details
              </div>
              <div className="w-40 text-center">Dates</div>
              <div className="w-28 text-center">Status</div>
              <div className="w-28 text-center border-l border-gray-200 px-2 sm:px-3">
                Actions
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {paged.map((e, idx) => {
                const s = getStatus(e.startDate, e.endDate);
                const globalIdx = (page - 1) * pageSize + idx;
                const circleClass = "bg-indigo-100 text-indigo-700";
                return (
                  <div key={e.id} className="px-4 py-3 overflow-hidden">
                    <div className="flex items-start gap-4 md:gap-6 w-full">
                      <div className="w-12 flex-shrink-0 flex items-center justify-center">
                        <div
                          className={`w-7 h-7 rounded-full ${circleClass} flex items-center justify-center text-xs sm:text-sm font-semibold leading-none`}
                        >
                          {globalIdx + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pl-3 md:pl-4 pr-2 sm:pr-4 md:pr-6 lg:pr-10">
                        <h3
                          className="text-sm sm:text-base font-semibold text-gray-900 truncate"
                          title={e.title}
                        >
                          {ellipsis(e.title, 40)}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                            <FiCalendar className="w-3.5 h-3.5" />
                            {formatDate(e.startDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 ring-1 ring-pink-200">
                            <FiCalendar className="w-3.5 h-3.5" />
                            {formatDate(e.endDate)}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-700">
                          <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-1">
                            <span className="font-semibold">Total Qs: </span>
                            {e.totalQuestions || 0}
                          </div>
                          <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-1">
                            <span className="font-semibold">Marks: </span>
                            {e.totalMarks || 0}
                          </div>
                          <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-1">
                            <span className="font-semibold">Passing: </span>
                            {e.passingMarks || 0}
                            {e.passingPercent ? ` (${e.passingPercent}%)` : ""}
                          </div>
                          <div className="rounded-md bg-gray-50 ring-1 ring-gray-200 px-2 py-1">
                            <span className="font-semibold">Rounds: </span>
                            {e.totalRounds || 0}
                          </div>
                        </div>
                        {e.eligibility ? (
                          <p
                            className="mt-2 text-xs text-gray-600 truncate"
                            title={e.eligibility}
                          >
                            {ellipsis(e.eligibility, 100)}
                          </p>
                        ) : null}
                      </div>
                      <div className="w-40 hidden md:flex justify-center">
                        <div className="text-xs text-gray-700 text-center">
                          {formatDate(e.startDate)} - {formatDate(e.endDate)}
                        </div>
                      </div>
                      <div className="w-28 hidden md:flex justify-center">
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
                      <div className="w-28 flex justify-end pl-4 sm:pl-5 border-l border-gray-200 gap-2">
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
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {modalType === "edit"
                  ? "Edit Record"
                  : modalType === "preview"
                  ? "Preview Record"
                  : "Add Record"}
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
                  {(() => {
                    const s = getStatus(current.startDate, current.endDate);
                    return s.label ? (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ring-1 whitespace-nowrap ${s.classes}`}
                      >
                        {s.label}
                      </span>
                    ) : null;
                  })()}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                    <FiCalendar className="w-3.5 h-3.5" />
                    {formatDate(current.startDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-pink-50 text-pink-700 ring-1 ring-pink-200">
                    <FiCalendar className="w-3.5 h-3.5" />
                    {formatDate(current.endDate)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3">
                    <div className="text-gray-600">Total Questions</div>
                    <div className="font-semibold">
                      {current.totalQuestions || 0}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3">
                    <div className="text-gray-600">Total Marks</div>
                    <div className="font-semibold">
                      {current.totalMarks || 0}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3">
                    <div className="text-gray-600">Passing Marks</div>
                    <div className="font-semibold">
                      {current.passingMarks || 0}
                      {current.passingPercent
                        ? ` (${current.passingPercent}%)`
                        : ""}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3">
                    <div className="text-gray-600">Total Rounds</div>
                    <div className="font-semibold">
                      {current.totalRounds || 0}
                    </div>
                  </div>
                </div>
                {current.eligibility ? (
                  <div>
                    <div className="text-gray-700 font-medium mb-1">
                      Who can apply
                    </div>
                    <div
                      className="text-gray-700 whitespace-pre-wrap leading-relaxed"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {current.eligibility}
                    </div>
                  </div>
                ) : null}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={onChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. JEE Main 2024"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={onChange}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={onChange}
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Questions
                    </label>
                    <input
                      type="number"
                      name="totalQuestions"
                      value={form.totalQuestions}
                      onChange={onChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={form.totalMarks}
                      onChange={onChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      name="passingMarks"
                      value={form.passingMarks}
                      onChange={onChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Passing %
                    </label>
                    <input
                      type="number"
                      name="passingPercent"
                      value={form.passingPercent}
                      onChange={onChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Rounds
                    </label>
                    <input
                      type="number"
                      name="totalRounds"
                      value={form.totalRounds}
                      onChange={onChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Eligibility / Who can apply
                  </label>
                  <textarea
                    name="eligibility"
                    value={form.eligibility}
                    onChange={onChange}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      : "Save Record"}
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
          toDelete?.title || "this record"
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

export default AdminImportantDatesPage;
