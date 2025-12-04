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
import {
  MdAdd,
  MdClose,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdCheck,
  MdCheckCircle,
} from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import DeleteConfirmModal from "../../components/Admin/DeleteConfirmModal";
import { useNavigate } from "react-router-dom";

const AdminOldPapersPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("create"); // create | edit | preview
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    question: "",
    options: ["", ""],
    explanation: "",
    correctIndex: -1,
  });

  // Papers management state
  const [papers, setPapers] = useState([]);
  const [paperForm, setPaperForm] = useState({
    title: "",
    description: "",
    totalMarks: "",
    duration: "",
    level: "normal",
  });
  const [paperSearch, setPaperSearch] = useState("");
  const [paperSortBy, setPaperSortBy] = useState("newest");
  const [paperDeleteOpen, setPaperDeleteOpen] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState(null);
  const [paperDeleteLoading, setPaperDeleteLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "oldPapers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  // Subscribe to Papers metadata
  useEffect(() => {
    const q = query(collection(db, "papers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setPapers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const ellipsis = (t, m) => {
    const s = String(t || "");
    return s.length > m ? s.slice(0, m) + "..." : s;
  };

  // Derived papers list with search and sort
  const displayedPapers = useMemo(() => {
    const term = paperSearch.trim().toLowerCase();
    const arr = term
      ? papers.filter(
          (p) =>
            (p.title || "").toLowerCase().includes(term) ||
            (p.description || "").toLowerCase().includes(term)
        )
      : papers.slice();
    arr.sort((a, b) =>
      paperSortBy === "oldest"
        ? (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
        : (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
    return arr;
  }, [papers, paperSearch, paperSortBy]);

  const openCreate = () => {
    setModalType("create");
    setCurrent(null);
    setForm({
      question: "",
      options: ["", ""],
      explanation: "",
      correctIndex: -1,
    });
    setError("");
    setOpen(true);
  };

  const openEdit = (item) => {
    setModalType("edit");
    setCurrent(item);
    const opts =
      Array.isArray(item.options) && item.options.length > 0
        ? item.options.slice()
        : ["", ""];
    let ci = typeof item.correctIndex === "number" ? item.correctIndex : -1;
    if (ci >= opts.length) ci = -1;
    setForm({
      question: item.question || "",
      options: opts,
      explanation: item.explanation || "",
      correctIndex: ci,
    });
    setError("");
    setOpen(true);
  };

  const openPreview = (item) => {
    setModalType("preview");
    setCurrent(item);
    setOpen(true);
  };

  // Paper open handlers
  const openPaperCreate = () => {
    setModalType("paper-create");
    setCurrent(null);
    setPaperForm({
      title: "",
      description: "",
      totalMarks: "",
      duration: "",
      level: "normal",
    });
    setError("");
    setOpen(true);
  };

  const openPaperEdit = (paper) => {
    setModalType("paper-edit");
    setCurrent(paper);
    setPaperForm({
      title: paper.title || "",
      description: paper.description || "",
      totalMarks: String(paper.totalMarks ?? ""),
      duration: String(paper.duration ?? ""),
      level: paper.level || "normal",
    });
    setError("");
    setOpen(true);
  };

  const openPaperPreview = (paper) => {
    setModalType("paper-preview");
    setCurrent(paper);
    setOpen(true);
  };

  const openPaperDelete = (paper) => {
    setPaperToDelete(paper);
    setPaperDeleteOpen(true);
  };
  const handleCancelPaperDelete = () => {
    setPaperToDelete(null);
    setPaperDeleteOpen(false);
  };
  const handleConfirmPaperDelete = async () => {
    if (!paperToDelete?.id) return;
    setPaperDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "papers", paperToDelete.id));
      setPaperToDelete(null);
      setPaperDeleteOpen(false);
    } catch (err) {
      alert("Failed to delete paper");
    } finally {
      setPaperDeleteLoading(false);
    }
  };

  const openDelete = (item) => {
    setToDelete(item);
    setDeleteOpen(true);
  };
  const handleCancelDelete = () => {
    setToDelete(null);
    setDeleteOpen(false);
  };
  const handleConfirmDelete = async () => {
    if (!toDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, "oldPapers", toDelete.id));
      setToDelete(null);
      setDeleteOpen(false);
    } catch (err) {
      alert("Failed to delete question");
    } finally {
      setDeleteLoading(false);
    }
  };

  const setOption = (idx, val) => {
    setForm((f) => {
      const next = f.options.slice();
      next[idx] = val;
      return { ...f, options: next };
    });
  };
  const addOption = () =>
    setForm((f) => ({ ...f, options: [...f.options, ""] }));
  const removeOption = (idx) =>
    setForm((f) => {
      const next = f.options.slice();
      if (next.length <= 2) return f; // keep at least 2
      next.splice(idx, 1);
      let ci = f.correctIndex;
      if (ci === idx) ci = -1;
      else if (ci > idx) ci = ci - 1;
      return { ...f, options: next, correctIndex: ci };
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const q = form.question.trim();
    const trimmed = (form.options || []).map((o) => String(o || "").trim());
    if (trimmed.some((o) => !o)) {
      setError("Please fill all options.");
      return;
    }
    const opts = trimmed;
    if (!q) {
      setError("Question is required.");
      return;
    }
    if (opts.length < 2) {
      setError("At least two options are required.");
      return;
    }
    if (form.correctIndex < 0 || form.correctIndex >= opts.length) {
      setError("Please select the correct answer.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        question: q,
        options: opts,
        explanation: String(form.explanation || "").trim(),
        correctIndex: form.correctIndex,
      };
      if (modalType === "edit" && current?.id) {
        await updateDoc(doc(db, "oldPapers", current.id), {
          ...payload,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "oldPapers"), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }
      setOpen(false);
      setCurrent(null);
      setForm({
        question: "",
        options: ["", ""],
        explanation: "",
        correctIndex: -1,
      });
    } catch (err) {
      setError("Failed to save question.");
    } finally {
      setLoading(false);
    }
  };

  // Paper submit
  const onPaperSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!paperForm.title.trim()) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: paperForm.title.trim(),
        description: paperForm.description.trim(),
        totalMarks: Number(paperForm.totalMarks) || 0,
        duration: Number(paperForm.duration) || 0,
        level: paperForm.level || "normal",
      };
      if (modalType === "paper-edit" && current?.id) {
        await updateDoc(doc(db, "papers", current.id), {
          ...payload,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "papers"), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }
      setOpen(false);
      setCurrent(null);
      setPaperForm({
        title: "",
        description: "",
        totalMarks: "",
        duration: "",
        level: "normal",
      });
    } catch (err) {
      setError("Failed to save paper.");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = [
    {
      title: "Total Papers",
      value: "89",
      bg: "bg-indigo-50",
      color: "text-indigo-600",
      gradient: "from-indigo-600 to-blue-600",
    },
    {
      title: "Total Questions",
      value: "2,456",
      bg: "bg-blue-50",
      color: "text-blue-600",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      title: "Years Covered",
      value: "15",
      bg: "bg-purple-50",
      color: "text-purple-600",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      title: "Attempts",
      value: "5,789",
      bg: "bg-green-50",
      color: "text-green-600",
      gradient: "from-green-600 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Old Question Papers
          </h1>
          <p className="text-gray-600 mt-1">
            Manage previous year question papers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openPaperCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <MdAdd className="h-5 w-5" /> Add Paper
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-white rounded-xl border border-slate-300 p-5 group cursor-pointer"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-bl ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
            <div
              className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${stat.gradient} rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 group-hover:text-white/90 transition-colors duration-300">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 ${stat.bg} rounded-lg group-hover:bg-white/20 group-hover:-rotate-6 transition-all duration-300`}
                >
                  <svg
                    className={`w-8 h-8 ${stat.color} group-hover:text-white group-hover:scale-110 transition-all duration-300`}
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
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                    {index === 2 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    )}
                    {index === 3 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Papers toolbar */}
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={paperSearch}
            onChange={(e) => setPaperSearch(e.target.value)}
            placeholder="Search papers..."
            className="w-full h-12 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm placeholder:text-gray-400 transition-all focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex items-center gap-2 sm:self-auto self-end">
          <select
            value={paperSortBy}
            onChange={(e) => setPaperSortBy(e.target.value)}
            className="h-12 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
            title="Sort"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Papers table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        {displayedPapers.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            {paperSearch.trim()
              ? "No papers match your search."
              : "No papers yet. Use Add Paper to create one."}
          </div>
        ) : (
          <>
            <div className="flex md:hidden items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-700 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-b border-gray-200 rounded-t-xl px-3 py-2">
              <div className="w-12 text-center">Sr No</div>
              <div className="flex-1 text-left pl-2">Paper</div>
              <div className="w-16 text-center">Add Que</div>
              <div className="w-20 text-center">Actions</div>
            </div>
            <div className="hidden md:flex items-center gap-4 md:gap-6 text-xs font-semibold uppercase tracking-wide text-gray-700 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-b border-gray-200 rounded-t-xl px-4 py-2.5">
              <div className="w-12 text-center">Sr No</div>
              <div className="flex-1 text-left pl-3 md:pl-4">Paper</div>
              <div className="w-40 text-center">Duration</div>
              <div className="w-28 text-center">Marks</div>
              <div className="w-28 text-center">Level</div>
              <div className="w-20 text-center">Add Que</div>
              <div className="w-28 text-center border-l border-gray-200 px-2 sm:px-3">
                Actions
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {displayedPapers.map((p, idx) => (
                <div key={p.id} className="px-4 py-3 overflow-hidden">
                  <div className="flex items-start gap-4 md:gap-6 w-full">
                    <div className="w-12 flex-shrink-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs sm:text-sm font-semibold leading-none">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pl-3 md:pl-4 pr-2 sm:pr-4 md:pr-6 lg:pr-10">
                      <h3
                        className="text-sm sm:text-base font-semibold text-gray-900 truncate"
                        title={p.title}
                      >
                        {ellipsis(p.title, 60)}
                      </h3>
                      {p.description ? (
                        <p
                          className="mt-1 text-xs text-gray-600 truncate"
                          title={p.description}
                        >
                          {ellipsis(p.description, 90)}
                        </p>
                      ) : null}
                    </div>
                    <div className="w-40 hidden md:flex justify-center">
                      <div className="text-xs text-gray-700 text-center">
                        {Number(p.duration) || 0}m
                      </div>
                    </div>
                    <div className="w-28 hidden md:flex justify-center">
                      <div className="text-xs text-gray-700 text-center">
                        {Number(p.totalMarks) || 0}
                      </div>
                    </div>
                    <div className="w-28 hidden md:flex justify-center">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ring-1 whitespace-nowrap ${
                          p.level === "hard"
                            ? "bg-rose-50 text-rose-700 ring-rose-200"
                            : p.level === "medium"
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        }`}
                      >
                        {p.level || "normal"}
                      </span>
                    </div>
                    <div className="w-20 hidden md:flex justify-center">
                      <button
                        onClick={() =>
                          navigate(`/old-papers/${p.id}/questions`)
                        }
                        title="Add Questions"
                        className="p-1.5 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 shadow-sm"
                      >
                        <MdAdd className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-28 flex justify-end pl-4 sm:pl-5 border-l border-gray-200 gap-2">
                      <button
                        onClick={() => openPaperPreview(p)}
                        title="Preview"
                        className="p-1.5 rounded-full border text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm"
                      >
                        <MdVisibility className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPaperEdit(p)}
                        title="Edit"
                        className="p-1.5 rounded-full border text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 shadow-sm"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openPaperDelete(p)}
                        title="Delete"
                        className="p-1.5 rounded-full border text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100 shadow-sm"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {modalType === "edit"
                  ? "Edit Question"
                  : modalType === "preview"
                  ? "Preview Question"
                  : modalType === "create"
                  ? "Add Question"
                  : modalType === "paper-edit"
                  ? "Edit Paper"
                  : modalType === "paper-preview"
                  ? "Preview Paper"
                  : modalType === "paper-create"
                  ? "Add Paper"
                  : "Add Question"}
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
                <div
                  className="text-gray-900 text-base font-semibold break-words whitespace-pre-wrap"
                  style={{ overflowWrap: "anywhere" }}
                >
                  {current.question}
                </div>
                {Array.isArray(current.options) &&
                current.options.length > 0 ? (
                  <div className="space-y-2">
                    {current.options.map((op, i) => {
                      const isCorrect =
                        typeof current.correctIndex === "number" &&
                        current.correctIndex === i;
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-sm font-medium text-gray-700">
                              {letter})
                            </div>
                            <div
                              className="break-words whitespace-pre-wrap"
                              style={{ overflowWrap: "anywhere" }}
                            >
                              {op}
                            </div>
                          </div>
                          {isCorrect ? (
                            <MdCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {current.explanation ? (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Explanation:</span>{" "}
                    <span
                      className="break-words"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {current.explanation}
                    </span>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question
                  </label>
                  <textarea
                    value={form.question}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, question: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter the question"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    <button
                      type="button"
                      onClick={addOption}
                      className="text-indigo-600 text-sm hover:underline"
                    >
                      Add option
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {form.options.map((op, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({ ...f, correctIndex: i }))
                          }
                          className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                            form.correctIndex === i
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-gray-300 bg-white"
                          }`}
                          title="Mark as correct"
                          aria-pressed={form.correctIndex === i}
                        >
                          {form.correctIndex === i ? (
                            <MdCheck className="w-4 h-4 text-emerald-600" />
                          ) : null}
                        </button>
                        <input
                          type="text"
                          value={op}
                          onChange={(e) => setOption(i, e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Option ${i + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="px-2 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                          title="Remove option"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500">
                      Click the circle next to an option to mark it as the
                      correct answer.
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Explanation (optional)
                  </label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, explanation: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add an explanation (optional)"
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
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}

            {(modalType === "paper-create" || modalType === "paper-edit") && (
              <form onSubmit={onPaperSubmit} className="p-4 space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Paper title
                  </label>
                  <input
                    type="text"
                    value={paperForm.title}
                    onChange={(e) =>
                      setPaperForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. SSC CGL 2025 - Paper 1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={paperForm.description}
                    onChange={(e) =>
                      setPaperForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe the paper"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total marks
                    </label>
                    <input
                      type="number"
                      value={paperForm.totalMarks}
                      onChange={(e) =>
                        setPaperForm((f) => ({
                          ...f,
                          totalMarks: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={paperForm.duration}
                      onChange={(e) =>
                        setPaperForm((f) => ({
                          ...f,
                          duration: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. 60"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Level of test
                  </label>
                  <select
                    value={paperForm.level}
                    onChange={(e) =>
                      setPaperForm((f) => ({ ...f, level: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="hard">Hard</option>
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                  </select>
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
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}

            {modalType === "paper-preview" && current && (
              <div className="p-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-gray-100 rounded-lg overflow-hidden">
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <th className="w-40 bg-gray-50 px-4 py-2 text-gray-700 font-medium">
                          Title
                        </th>
                        <td
                          className="px-4 py-2 text-gray-900 break-words"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {current.title || "—"}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-gray-50 px-4 py-2 text-gray-700 font-medium align-top">
                          Description
                        </th>
                        <td
                          className="px-4 py-2 text-gray-700 break-words"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {current.description || "—"}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-gray-50 px-4 py-2 text-gray-700 font-medium">
                          Duration
                        </th>
                        <td className="px-4 py-2 text-gray-700">
                          {Number(current.duration) || 0}m
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-gray-50 px-4 py-2 text-gray-700 font-medium">
                          Total Marks
                        </th>
                        <td className="px-4 py-2 text-gray-700">
                          {Number(current.totalMarks) || 0}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-gray-50 px-4 py-2 text-gray-700 font-medium">
                          Level
                        </th>
                        <td className="px-4 py-2 text-gray-700">
                          {current.level || "normal"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={deleteOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete \"${
          toDelete?.question || "this question"
        }\"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
      />

      <DeleteConfirmModal
        open={paperDeleteOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete \"${
          paperToDelete?.title || "this paper"
        }\"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmPaperDelete}
        onCancel={handleCancelPaperDelete}
        loading={paperDeleteLoading}
      />
    </div>
  );
};

export default AdminOldPapersPage;
