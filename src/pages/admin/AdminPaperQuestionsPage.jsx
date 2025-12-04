import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { MdAdd, MdClose, MdVisibility, MdEdit, MdDelete, MdCheck, MdCheckCircle } from 'react-icons/md';
import DeleteConfirmModal from '../../components/Admin/DeleteConfirmModal';

const AdminPaperQuestionsPage = () => {
  const { paperId } = useParams();
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ question: '', options: ['', ''], explanation: '', correctIndex: -1 });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!paperId) return;
    const ref = doc(db, 'papers', paperId);
    const unsub = onSnapshot(ref, (snap) => setPaper(snap.exists() ? { id: snap.id, ...snap.data() } : null));
    return () => unsub();
  }, [paperId]);

  useEffect(() => {
    if (!paperId) return;
    const q = query(collection(db, 'papers', paperId, 'questions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setQuestions(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [paperId]);

  const ellipsis = (t, m) => {
    const s = String(t || '');
    return s.length > m ? s.slice(0, m) + '...' : s;
  };

  const openCreate = () => {
    setModalType('create');
    setCurrent(null);
    setForm({ question: '', options: ['', ''], explanation: '', correctIndex: -1 });
    setError('');
    setOpen(true);
  };

  const openEdit = (item) => {
    setModalType('edit');
    setCurrent(item);
    const opts = Array.isArray(item.options) && item.options.length > 0 ? item.options.slice() : ['', ''];
    let ci = typeof item.correctIndex === 'number' ? item.correctIndex : -1;
    if (ci >= opts.length) ci = -1;
    setForm({ question: item.question || '', options: opts, explanation: item.explanation || '', correctIndex: ci });
    setError('');
    setOpen(true);
  };

  const openPreview = (item) => { setModalType('preview'); setCurrent(item); setOpen(true); };

  const openDelete = (item) => { setToDelete(item); setDeleteOpen(true); };
  const handleCancelDelete = () => { setToDelete(null); setDeleteOpen(false); };
  const handleConfirmDelete = async () => {
    if (!paperId || !toDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deleteDoc(doc(db, 'papers', paperId, 'questions', toDelete.id));
      setToDelete(null);
      setDeleteOpen(false);
    } catch (err) {
      alert('Failed to delete question');
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
  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, ''] }));
  const removeOption = (idx) => setForm((f) => {
    const next = f.options.slice();
    if (next.length <= 2) return f;
    next.splice(idx, 1);
    let ci = f.correctIndex;
    if (ci === idx) ci = -1; else if (ci > idx) ci = ci - 1;
    return { ...f, options: next, correctIndex: ci };
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!paperId) return;
    setError('');
    const q = form.question.trim();
    const opts = (form.options || []).map((o) => String(o || '').trim());
    if (!q) { setError('Question is required.'); return; }
    if (opts.length < 2) { setError('At least two options are required.'); return; }
    if (opts.some((o) => !o)) { setError('Please fill all options.'); return; }
    if (form.correctIndex < 0 || form.correctIndex >= opts.length) { setError('Please select the correct answer.'); return; }

    setLoading(true);
    try {
      const payload = {
        question: q,
        options: opts,
        explanation: String(form.explanation || '').trim(),
        correctIndex: form.correctIndex,
      };
      if (modalType === 'edit' && current?.id) {
        await updateDoc(doc(db, 'papers', paperId, 'questions', current.id), { ...payload, updatedAt: Timestamp.now() });
      } else {
        await addDoc(collection(db, 'papers', paperId, 'questions'), { ...payload, createdAt: Timestamp.now() });
      }
      setOpen(false);
      setCurrent(null);
      setForm({ question: '', options: ['', ''], explanation: '', correctIndex: -1 });
    } catch (err) {
      setError('Failed to save question.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6 overflow-x-hidden px-3 sm:px-4 md:px-6 pt-3 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Add Questions</h1>
          <p className="text-gray-600 mt-1">{paper ? `Paper: ${paper.title}` : 'Loading paper...'}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <MdAdd className="h-5 w-5" /> Add Question
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {questions.length === 0 ? (
          <div className="col-span-full p-6 text-center text-gray-600 bg-white border border-gray-100 rounded-xl shadow-sm">
            No questions yet. Use Add Question to create one.
          </div>
        ) : (
          questions.map((it, idx) => (
            <div key={it.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">{idx + 1}</div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate" title={it.question}>{ellipsis(it.question, 120)}</h3>
                  {Array.isArray(it.options) && it.options.length > 0 ? (
                    <div className="mt-1 text-xs text-gray-600 truncate" title={it.options.join(', ')}>
                      {ellipsis(it.options.join(', '), 140)}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                <button onClick={() => openPreview(it)} title="Preview" className="p-1.5 rounded-full border text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm"><MdVisibility className="w-4 h-4" /></button>
                <button onClick={() => openEdit(it)} title="Edit" className="p-1.5 rounded-full border text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 shadow-sm"><MdEdit className="w-4 h-4" /></button>
                <button onClick={() => openDelete(it)} title="Delete" className="p-1.5 rounded-full border text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100 shadow-sm"><MdDelete className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">{modalType === 'edit' ? 'Edit Question' : modalType === 'preview' ? 'Preview Question' : 'Add Question'}</h2>
              <button onClick={() => setOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50" aria-label="Close"><MdClose className="h-5 w-5" /></button>
            </div>

            {modalType === 'preview' && current && (
              <div className="p-4 space-y-3">
                <div className="text-gray-900 text-base font-semibold break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere' }}>{current.question}</div>
                {Array.isArray(current.options) && current.options.length > 0 ? (
                  <div className="space-y-2">
                    {current.options.map((op, i) => {
                      const isCorrect = typeof current.correctIndex === 'number' && current.correctIndex === i;
                      const letter = String.fromCharCode(65 + i);
                      return (
                        <div key={i} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-sm font-medium text-gray-700">{letter})</div>
                            <div className="break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere' }}>{op}</div>
                          </div>
                          {isCorrect ? (<MdCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                {current.explanation ? (
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Explanation:</span> <span className="break-words" style={{ overflowWrap: 'anywhere' }}>{current.explanation}</span>
                  </div>
                ) : null}
                <div className="flex justify-end pt-2">
                  <button onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
                </div>
              </div>
            )}

            {(modalType === 'create' || modalType === 'edit') && (
              <form onSubmit={onSubmit} className="p-4 space-y-4">
                {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">{error}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Question</label>
                  <textarea
                    value={form.question}
                    onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter the question"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    <button type="button" onClick={addOption} className="text-indigo-600 text-sm hover:underline">Add option</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {form.options.map((op, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, correctIndex: i }))}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center ${form.correctIndex === i ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 bg-white'}`}
                          title="Mark as correct"
                          aria-pressed={form.correctIndex === i}
                        >
                          {form.correctIndex === i ? <MdCheck className="w-4 h-4 text-emerald-600" /> : null}
                        </button>
                        <input
                          type="text"
                          value={op}
                          onChange={(e) => setOption(i, e.target.value)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Option ${i + 1}`}
                        />
                        <button type="button" onClick={() => removeOption(i)} className="px-2 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" title="Remove option">Remove</button>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500">Click the circle next to an option to mark it as the correct answer.</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Explanation (optional)</label>
                  <textarea
                    value={form.explanation}
                    onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Add an explanation (optional)"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" disabled={loading}>Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <DeleteConfirmModal
        open={deleteOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete \"${toDelete?.question || 'this question'}\"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteLoading}
      />
    </section>
  );
};

export default AdminPaperQuestionsPage;
