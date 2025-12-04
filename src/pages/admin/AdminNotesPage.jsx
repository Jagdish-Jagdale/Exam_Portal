import React, { useEffect, useMemo, useRef, useState } from "react";
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
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../../firebase";
import {
  MdAdd,
  MdClose,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdLink,
  MdUpload,
} from "react-icons/md";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import DeleteConfirmModal from "../../components/Admin/DeleteConfirmModal";

const AdminNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState("file");
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const [fileForm, setFileForm] = useState({ title: "", file: null });
  const [linkForm, setLinkForm] = useState({ title: "", url: "" });
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setNotes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const ellipsis = (t, m) => {
    const s = String(t || "");
    return s.length > m ? s.slice(0, m) + "..." : s;
  };

  const toMillis = (ts) => {
    if (!ts) return 0;
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    if (ts.seconds) return ts.seconds * 1000;
    return Number(ts) || 0;
  };

  const formatDate = (ms) => {
    if (!ms) return "";
    const d = new Date(ms);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };

  const displayed = useMemo(() => {
    const term = search.trim().toLowerCase();
    const arr = term
      ? notes.filter(
          (n) =>
            (n.title || "").toLowerCase().includes(term) ||
            (n.fileName || "").toLowerCase().includes(term) ||
            (n.url || "").toLowerCase().includes(term)
        )
      : notes.slice();
    arr.sort((a, b) =>
      sortBy === "oldest"
        ? toMillis(a.createdAt) - toMillis(b.createdAt)
        : toMillis(b.createdAt) - toMillis(a.createdAt)
    );
    return arr;
  }, [notes, search, sortBy]);

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

  const openDropdown = () => setDropdownOpen((v) => !v);
  const chooseFile = () => {
    setModalType("file");
    setCurrent(null);
    setFileForm({ title: "", file: null });
    setLinkForm({ title: "", url: "" });
    setOpen(true);
    setDropdownOpen(false);
    setError("");
  };
  const chooseLink = () => {
    setModalType("link");
    setCurrent(null);
    setFileForm({ title: "", file: null });
    setLinkForm({ title: "", url: "" });
    setOpen(true);
    setDropdownOpen(false);
    setError("");
  };

  const openEdit = (item) => {
    setCurrent(item);
    if (item.type === "file") {
      setModalType("file-edit");
      setFileForm({ title: item.title || "", file: null });
    } else {
      setModalType("link-edit");
      setLinkForm({ title: item.title || "", url: item.url || "" });
    }
    setError("");
    setOpen(true);
  };

  const openPreview = (item) => {
    setCurrent(item);
    setModalType("preview");
    setOpen(true);
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
      if (toDelete.type === "file" && toDelete.storagePath) {
        try {
          await deleteObject(ref(storage, toDelete.storagePath));
        } catch (_) {}
      }
      await deleteDoc(doc(db, "notes", toDelete.id));
      setToDelete(null);
      setDeleteOpen(false);
    } catch (err) {
      alert("Failed to delete note");
    } finally {
      setDeleteLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (modalType === "file") {
        if (!fileForm.file) {
          setError("Please select a file.");
          setLoading(false);
          return;
        }
        const name = fileForm.file.name || "file";
        const storagePath = `notes/${Date.now()}_${name}`;
        const storageRef = ref(storage, storagePath);
        const task = uploadBytesResumable(storageRef, fileForm.file);
        await new Promise((resolve, reject) => {
          task.on(
            "state_changed",
            (snap) => {
              if (snap.totalBytes)
                setUploadProgress(
                  Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                );
            },
            reject,
            resolve
          );
        });
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(db, "notes"), {
          title: fileForm.title?.trim() || fileForm.file.name,
          type: "file",
          url,
          fileName: name,
          size: fileForm.file.size || 0,
          storagePath,
          createdAt: Timestamp.now(),
        });
      } else if (modalType === "link") {
        if (!linkForm.title.trim() || !linkForm.url.trim()) {
          setError("Title and URL are required.");
          setLoading(false);
          return;
        }
        await addDoc(collection(db, "notes"), {
          title: linkForm.title.trim(),
          type: "link",
          url: linkForm.url.trim(),
          createdAt: Timestamp.now(),
        });
      } else if (modalType === "file-edit" && current?.id) {
        await updateDoc(doc(db, "notes", current.id), {
          title: fileForm.title.trim() || current.title,
          updatedAt: Timestamp.now(),
        });
      } else if (modalType === "link-edit" && current?.id) {
        if (!linkForm.title.trim() || !linkForm.url.trim()) {
          setError("Title and URL are required.");
          setLoading(false);
          return;
        }
        await updateDoc(doc(db, "notes", current.id), {
          title: linkForm.title.trim(),
          url: linkForm.url.trim(),
          updatedAt: Timestamp.now(),
        });
      }
      setOpen(false);
      setCurrent(null);
      setFileForm({ title: "", file: null });
      setLinkForm({ title: "", url: "" });
      setUploadProgress(0);
    } catch (err) {
      setError("Failed to save note.");
    } finally {
      setLoading(false);
    }
  };

  const viewNote = (n) => {
    if (n?.url) window.open(n.url, "_blank", "noopener,noreferrer");
  };

  // Statistics
  const stats = [
    {
      title: "Total Notes",
      value: "156",
      icon: "📚",
      bg: "bg-blue-50",
      color: "text-blue-600",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      title: "Categories",
      value: "12",
      icon: "📂",
      bg: "bg-purple-50",
      color: "text-purple-600",
      gradient: "from-purple-500 to-violet-500",
    },
    {
      title: "Downloads",
      value: "3,247",
      icon: "⬇️",
      bg: "bg-green-50",
      color: "text-green-600",
      gradient: "from-green-500 to-teal-500",
    },
    {
      title: "This Week",
      value: "8",
      icon: "🆕",
      bg: "bg-orange-50",
      color: "text-orange-600",
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Notes Management
          </h1>
          <p className="text-gray-600 mt-1">Manage study notes and materials</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={openDropdown}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <MdAdd className="h-5 w-5" /> Add Notes{" "}
            <FiChevronDown className="w-4 h-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
              <button
                onClick={chooseFile}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MdUpload className="w-4 h-4" /> Upload File
              </button>
              <button
                onClick={chooseLink}
                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <MdLink className="w-4 h-4" /> Add Link
              </button>
            </div>
          )}
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
              className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-400`}
            />
            <svg
              className={`absolute -bottom-10 -right-10 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="currentColor"
                className="text-gray-400 group-hover:text-white"
              />
            </svg>
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
                  className={`p-3 ${stat.bg} rounded-lg group-hover:bg-white/20 transition-all duration-300`}
                >
                  <svg
                    className={`w-8 h-8 ${stat.color} group-hover:text-white group-hover:scale-125 transition-all duration-300`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {index === 0 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    )}
                    {index === 1 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
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
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ...existing content... */}
    </div>
  );
};

export default AdminNotesPage;
