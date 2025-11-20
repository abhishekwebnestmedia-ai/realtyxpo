import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Edit3, FilePlus2, FolderOpen, Loader2, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import useIsSuperAdmin from '../../hooks/useIsSuperAdmin';
import api from '../../api/api';
import AnimatedFolder from '../../components/ui/AnimatedFolder';
import { useModal } from '../../context/ModalContext';

const colorPalette = [
  { tip: '#FF9A56', cover: '#FFE563' },
  { tip: '#6EC1E4', cover: '#C2F3FF' },
  { tip: '#A66DE9', cover: '#E2D4FF' },
  { tip: '#FF8F8F', cover: '#FFDCDC' },
  { tip: '#57D8A3', cover: '#D2F8E7' },
];

const useAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return useMemo(() => (token ? { Authorization: `Bearer ${token}` } : null), [token]);
};

const LearnGrow = () => {
  const authHeaders = useAuthHeaders();
  const [folders, setFolders] = useState([]);
  const [foldersLoading, setFoldersLoading] = useState(false);
  const [foldersError, setFoldersError] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [showRenameForm, setShowRenameForm] = useState(false);
  const [renameName, setRenameName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const [activeFolderId, setActiveFolderId] = useState(null);
  const [folderContents, setFolderContents] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState(null);

  const [feedback, setFeedback] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);

  const fileInputRef = useRef(null);
  const isSuperAdmin = useIsSuperAdmin();

  const activeFolder = useMemo(
    () => folders.find((folder) => folder._id === activeFolderId) || null,
    [folders, activeFolderId]
  );
  const { showConfirm } = useModal();
  const hasActiveFolder = Boolean(activeFolder && activeFolder._id);

  const apiOrigin = useMemo(() => {
    if (typeof window === 'undefined') return 'https://backend.realtyxpo.in';
    try {
      return new URL(api.defaults.baseURL || window.location.origin).origin;
    } catch {
      return window.location.origin;
    }
  }, []);

  const extractApiError = (err) => (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Something went wrong'
  );

  const fetchFolders = useCallback(async () => {
    if (!authHeaders) {
      setFoldersError('Authentication token missing. Please log in again.');
      return;
    }

    setFoldersLoading(true);
    setFoldersError(null);
    try {
      const resp = await api.get('/learn/all/folders', { headers: authHeaders });
      const data = resp.data?.data || resp.data || [];
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load folders', err);
      setFoldersError(extractApiError(err));
    } finally {
      setFoldersLoading(false);
    }
  }, [authHeaders]);

  const fetchFolderContents = useCallback(async (folderId) => {
    if (!authHeaders) {
      setContentError('Authentication token missing. Please log in again.');
      return;
    }

    setContentLoading(true);
    setContentError(null);
    try {
      const resp = await api.get(`/learn/${folderId}`, { headers: authHeaders });
      const data = resp.data?.data || resp.data || null;
      setFolderContents(data);
    } catch (err) {
      console.error('Failed to load folder contents', err);
      setContentError(extractApiError(err));
      setFolderContents(null);
    } finally {
      setContentLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    if (activeFolder) {
      setRenameName(activeFolder.name || '');
    } else {
      setRenameName('');
    }
  }, [activeFolder]);

  const handleRenameFolder = async (event) => {
    event.preventDefault();
    if (!activeFolder) {
      setFeedback({ type: 'error', message: 'Select a folder to rename.' });
      return;
    }

    const trimmed = renameName.trim();
    if (!trimmed) {
      setFeedback({ type: 'error', message: 'Folder name cannot be empty.' });
      return;
    }

    if (!authHeaders) {
      setFeedback({ type: 'error', message: 'Authentication token missing. Please log in again.' });
      return;
    }

    setRenameLoading(true);
    setFeedback(null);
    try {
      const resp = await api.put(
        `/learn/${activeFolder._id}`,
        { name: trimmed },
        { headers: authHeaders }
      );
      const updated = resp.data?.data || resp.data;
      if (updated?._id) {
        setFolders((prev) => prev.map((folder) => (folder._id === updated._id ? { ...folder, ...updated } : folder)));
        setFeedback({ type: 'success', message: `Folder renamed to "${updated.name}".` });
        setShowRenameForm(false);
      } else {
        setFeedback({ type: 'error', message: 'Folder renamed, but response looked unexpected.' });
      }
    } catch (err) {
      console.error('Failed to rename folder', err);
      setFeedback({ type: 'error', message: extractApiError(err) });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleCreateFolder = async (event) => {
    event.preventDefault();
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      setFeedback({ type: 'error', message: 'Folder name cannot be empty.' });
      return;
    }

    if (!authHeaders) {
      setFeedback({ type: 'error', message: 'Authentication token missing. Please log in again.' });
      return;
    }

    setCreateLoading(true);
    setFeedback(null);
    try {
      const resp = await api.post(
        '/learn/folder',
        { name: trimmedName, parent: null },
        { headers: authHeaders }
      );
      const created = resp.data?.data || resp.data;
      if (created?._id) {
        // Add the new folder to the top of the list
        setFolders((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
        setFeedback({ type: 'success', message: `Folder "${created.name}" created.` });
        setNewFolderName('');
        setShowCreateForm(false);
      } else {
        setFeedback({ type: 'error', message: 'Folder created, but response looked unexpected.' });
      }
    } catch (err) {
      console.error('Failed to create folder', err);
      setFeedback({ type: 'error', message: extractApiError(err) });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!activeFolder) {
      setFeedback({ type: 'error', message: 'Select a folder to delete.' });
      return;
    }

    if (!authHeaders) {
      setFeedback({ type: 'error', message: 'Authentication token missing. Please log in again.' });
      return;
    }

    const confirmed = await showConfirm(`Are you sure you want to delete "${activeFolder.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/learn/${activeFolder._id}`, { headers: authHeaders });
      setFolders((prev) => prev.filter((folder) => folder._id !== activeFolder._id));
      setFeedback({ type: 'success', message: 'Folder deleted successfully.' });
      setActiveFolderId(null);
      setFolderContents(null);
      setShowRenameForm(false);
    } catch (err) {
      console.error('Failed to delete folder', err);
      setFeedback({ type: 'error', message: extractApiError(err) });
    }
  };

  const handleFolderClick = (folderId) => {
    setActiveFolderId(folderId);
  };

  const handleFolderDoubleClick = (folder) => {
    setActiveFolderId(folder._id);
    fetchFolderContents(folder._id);
  };

  const uploadFileToFolder = async (file) => {
    if (!activeFolder) {
      setFeedback({ type: 'error', message: 'Select a folder before uploading a file.' });
      return;
    }

    if (!authHeaders) {
      setFeedback({ type: 'error', message: 'Authentication token missing. Please log in again.' });
      return;
    }

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('parent', activeFolder._id);

    setUploadLoading(true);
    setFeedback(null);
    try {
      const resp = await api.post('/learn/file', formData, {
        headers: {
          ...authHeaders,
          'Content-Type': 'multipart/form-data',
        },
      });
      const created = resp.data?.data || resp.data;
      setFeedback({ type: 'success', message: `File "${created?.name || file.name}" uploaded.` });
      fetchFolderContents(activeFolder._id);
    } catch (err) {
      console.error('Failed to upload file', err);
      setFeedback({ type: 'error', message: extractApiError(err) });
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!fileId) return;
    if (!authHeaders) {
      setFeedback({ type: 'error', message: 'Authentication token missing. Please log in again.' });
      return;
    }

    const confirmed = await showConfirm('Are you sure you want to delete this file? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeletingFileId(fileId);
      await api.delete(`/learn/file/${fileId}`, { headers: authHeaders });
      setFeedback({ type: 'success', message: 'File deleted successfully.' });
      // refresh folder contents
      if (activeFolder?._id) fetchFolderContents(activeFolder._id);
    } catch (err) {
      console.error('Failed to delete file', err);
      setFeedback({ type: 'error', message: extractApiError(err) });
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleFileInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      uploadFileToFolder(selectedFile);
    }
  };

  const handleAddFileClick = () => {
    if (!activeFolder) {
      setFeedback({ type: 'error', message: 'Select a folder before adding a file.' });
      return;
    }
    fileInputRef.current?.click();
  };

  const renderFolderContents = () => {
    if (!activeFolder) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
          <FolderOpen className="mb-3 h-10 w-10 text-gray-400" />
          <p className="font-medium">Select a folder to preview its contents</p>
          <p className="text-sm">Double-click a folder from the left panel to load its data.</p>
        </div>
      );
    }

    if (contentLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      );
    }

    if (contentError) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{contentError}</span>
          </div>
        </div>
      );
    }

    if (!folderContents) {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
          <p className="font-medium">No content loaded yet.</p>
          <p className="text-sm">Double-click the folder again to refresh its data.</p>
        </div>
      );
    }

    const data = folderContents?.data || folderContents;
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.children)
        ? data.children
        : Array.isArray(data)
          ? data
          : null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <AnimatedFolder />
          <div>
            <p className="text-lg font-semibold text-gray-900">{activeFolder.name}</p>
            <p className="text-xs text-gray-500">
              Created on {activeFolder.createdAt ? new Date(activeFolder.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {items && items.length > 0 ? (
          <div className="rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Folder items</p>
              <button
                type="button"
                onClick={handleAddFileClick}
                disabled={uploadLoading}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold transition ${
                  uploadLoading
                    ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
                Add File
              </button>
            </div>
            <ul className="space-y-2">
                {items.map((item) => (
                <li
                  key={item._id || item.id || item.name}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.name || item.title || 'Untitled Item'}</p>
                    <p className="text-xs text-gray-500">
                      {item.type ? item.type.replace(/_/g, ' ') : 'Resource'}
                      {item.updatedAt ? ` • Updated ${new Date(item.updatedAt).toLocaleString()}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.type === 'file' && item.fileUrl ? (
                      <a
                        href={item.fileUrl.startsWith('http') ? item.fileUrl : `${apiOrigin}${item.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        Open
                      </a>
                    ) : null}

                    {isSuperAdmin && item._id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(item._id)}
                        disabled={deletingFileId === item._id}
                        className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition ${
                          deletingFileId === item._id ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete file"
                      >
                        {deletingFileId === item._id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
            <p className="font-medium">This folder is empty.</p>
            <p className="text-sm">Upload or create resources to populate it.</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddFileClick}
                disabled={uploadLoading}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  uploadLoading
                    ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {uploadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
                Add File
              </button>
            </div>
          </div>
        )}

        {!items && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm">
            <p className="mb-2 font-semibold text-gray-700">Raw API response</p>
            <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-4 text-slate-100">
{JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 ">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Learn &amp; Grow</h1>
          <p className="text-sm text-gray-500">Organise your learning resources inside folders.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh button removed per UX request */}
          <button
            type="button"
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New Folder
          </button>
          <button
            type="button"
            onClick={() => setShowRenameForm((prev) => !prev)}
            disabled={!hasActiveFolder}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition ${
              hasActiveFolder
                ? 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            Rename
          </button>
          {/* Add File is shown in the folder contents area only */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleDeleteFolder}
              disabled={!hasActiveFolder}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${
                hasActiveFolder
                  ? 'border border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50'
                  : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {feedback && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-600'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>{feedback.message}</span>
        </div>
      )}

      {showCreateForm && (
        <form
          onSubmit={handleCreateFolder}
          className="mt-5 flex flex-col  gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <label htmlFor="new-folder-name" className="block text-sm font-medium text-gray-700">
              Folder name
            </label>
            <input
              id="new-folder-name"
              type="text"
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder="e.g. Onboarding, Sales Playbooks"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={createLoading}
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewFolderName('');
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              disabled={createLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={createLoading}
            >
              {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create
            </button>
          </div>
        </form>
      )}

      {showRenameForm && activeFolder ? (
        <form
          onSubmit={handleRenameFolder}
          className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
        >
          {/* Heading in its own div */}
          <div className="sm:flex-1">
            <h3 className="text-sm font-medium text-gray-700">Rename folder</h3>
          </div>

          {/* Input and action buttons grouped together */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3 w-full">
            <input
              id="rename-folder-name"
              type="text"
              value={renameName}
              onChange={(event) => setRenameName(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Enter rename-folder-name"
              disabled={renameLoading}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowRenameForm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                disabled={renameLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={renameLoading}
              >
                {renameLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
                Save
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl p-2 sm:p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Your folders</p>
            {foldersLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>

          {foldersError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{foldersError}</span>
              </div>
            </div>
          ) : null}

          {!foldersLoading && !foldersError && folders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
              <p className="font-medium text-gray-600">No folders yet.</p>
              <p>Use the “New Folder” button to create your first workspace.</p>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {folders.map((folder, index) => {
              const palette = colorPalette[index % colorPalette.length];
              const isActive = activeFolderId === folder._id;
              return (
                <div
                  key={folder._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    // select and open on single click
                    handleFolderClick(folder._id);
                    handleFolderDoubleClick(folder);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      // keyboard activates same as single click
                      handleFolderClick(folder._id);
                      handleFolderDoubleClick(folder);
                    }
                  }}
                  className={`group flex flex-col items-center rounded-xl border px-4 py-5 text-center shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    isActive ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white hover:border-primary/40'
                  }`}
                >
                  <AnimatedFolder tipColor={palette.tip} coverColor={palette.cover} />
                  <p className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900">{folder.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : '—'}
                  </p>
                  {/* helper text removed - single click opens folder now */}
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-h-[320px] rounded-2xl p-2 sm:p-3 lg:p-6">
          {renderFolderContents()}
        </div>
      </div>
    </div>
  );
};

export default LearnGrow;