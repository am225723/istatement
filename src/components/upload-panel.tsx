'use client';

import { useEffect, useState } from 'react';
import { useUploadThing } from './uploadthing';
import { UploadCloud, ExternalLink } from 'lucide-react';

export function UploadPanel() {
  const [files, setFiles] = useState<any[]>([]);
  const [selected, setSelected] = useState<File[]>([]);
  const [message, setMessage] = useState('');
  const { startUpload, isUploading } = useUploadThing('conresUploader', {
    onClientUploadComplete: async () => {
      setMessage('Upload complete. File metadata was saved to Neon.');
      setSelected([]);
      await loadFiles();
    },
    onUploadError: (error) => setMessage(error.message)
  });

  async function loadFiles() {
    const res = await fetch('/api/files');
    const data = await res.json();
    setFiles(data.files || []);
  }

  useEffect(() => { loadFiles(); }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <section className="rounded-3xl bg-lavender p-6">
        <UploadCloud className="mb-4 h-9 w-9 text-rose" />
        <h2 className="text-3xl font-black">Upload files</h2>
        <p className="mt-2 text-slate-600">Files go to UploadThing. Metadata is saved in Neon under the signed-in Clerk user.</p>
        <input
          className="mt-6 block w-full rounded-2xl bg-white p-4"
          type="file"
          multiple
          accept="image/*,.pdf,.txt,audio/*"
          onChange={(e) => setSelected(Array.from(e.target.files || []))}
        />
        <button
          disabled={!selected.length || isUploading}
          onClick={() => startUpload(selected)}
          className="mt-4 w-full rounded-2xl bg-ink px-5 py-4 font-black text-white disabled:opacity-60"
        >
          {isUploading ? 'Uploading...' : `Upload ${selected.length || ''} file${selected.length === 1 ? '' : 's'}`}
        </button>
        {message && <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-700">{message}</p>}
      </section>

      <section>
        <h3 className="text-2xl font-black">File vault</h3>
        <div className="mt-4 space-y-3">
          {files.length === 0 && <p className="rounded-2xl bg-white p-5 text-slate-500">No files uploaded yet.</p>}
          {files.map((file) => (
            <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5">
              <span>
                <span className="block font-black text-plum">{file.name}</span>
                <span className="text-xs text-slate-400">{new Date(file.created_at).toLocaleString()}</span>
              </span>
              <ExternalLink className="h-5 w-5 text-rose" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
