// components/dataset/SavedList.tsx
'use client';

import { useDataset } from './DatasetProvider';

export function SavedList() {
  const { saved, currentId, openDataset, removeDataset } = useDataset();

  if (saved.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
        Saved tables
      </h2>
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
        {saved.map((item) => (
          <li
            key={item.id}
            className={`flex items-center justify-between px-4 py-2 text-sm ${item.id === currentId ? 'bg-violet-50' : ''
              }`}
          >
            <button onClick={() => openDataset(item.id)} className="text-left hover:underline">
              {item.name}
              <span className="ml-3 text-xs text-slate-400">
                {new Date(item.updatedAt).toLocaleString()}
              </span>
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this saved table?')) removeDataset(item.id);
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}