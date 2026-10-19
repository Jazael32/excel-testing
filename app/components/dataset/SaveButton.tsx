'use client';

import { useDataset } from './DatasetProvider';

export function SaveButton() {
  const { currentId, dirty, saveStatus, saveChanges } = useDataset();

  // Nothing to save until a table is open and stored in the database
  if (!currentId) return null;

  const saving = saveStatus === 'saving';

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={saveChanges}
        disabled={!dirty || saving}
        className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>

      {dirty && !saving && <span className="text-sm text-amber-600">Unsaved changes</span>}
      {!dirty && saveStatus === 'saved' && (
        <span className="text-sm text-emerald-600">All changes saved</span>
      )}
    </div>
  );
}