export type Row = Record<string, any>;
export type SavedItem = { id: string; name: string; updatedAt: number };

export interface DatasetState {
  headers: string[];
  data: Row[];
  currentId: string | null;
  saved: SavedItem[];
  loading: boolean;
  error: string | null;
  dirty: boolean; // there are edits not yet saved
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export const initialDatasetState: DatasetState = {
  headers: [],
  data: [],
  currentId: null,
  saved: [],
  loading: false,
  error: null,
  dirty: false,
  saveStatus: 'idle',
};

export type DatasetAction =
  | { type: 'LOADING'; value: boolean }
  | { type: 'ERROR'; message: string | null }
  | { type: 'SAVED_LIST_LOADED'; saved: SavedItem[] }
  | { type: 'TABLE_PARSED'; headers: string[]; data: Row[] }
  | { type: 'TABLE_SAVED'; id: string }
  | { type: 'TABLE_OPENED'; id: string; headers: string[]; data: Row[] }
  | { type: 'TABLE_CLEARED' }
  | { type: 'CELL_EDITED'; rowIndex: number; columnId: string; value: unknown }
  | { type: 'ROWS_DELETED'; rowIndexes: number[] }
  | { type: 'SAVE_STARTED' }
  | { type: 'SAVE_SUCCEEDED'; savedData: Row[] }
  | { type: 'SAVE_FAILED' };

export function datasetReducer(
  state: DatasetState,
  action: DatasetAction,
): DatasetState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: action.value };

    case 'ERROR':
      return { ...state, error: action.message };

    case 'SAVED_LIST_LOADED':
      return { ...state, saved: action.saved };

    // Excel recién parseado: se muestra de inmediato, aún sin id
    case 'TABLE_PARSED':
      return {
        ...state,
        headers: action.headers,
        data: action.data,
        currentId: null,
        error: null,
        dirty: false,
        saveStatus: 'idle',
      };

    case 'TABLE_OPENED':
      return {
        ...state,
        headers: action.headers,
        data: action.data,
        currentId: action.id,
        error: null,
        dirty: false,
        saveStatus: 'idle',
      };

    case 'TABLE_CLEARED':
      return {
        ...state,
        headers: [],
        data: [],
        currentId: null,
        dirty: false,
        saveStatus: 'idle',
      };

    case 'CELL_EDITED':
      return {
        ...state,
        data: state.data.map((row, i) =>
          i === action.rowIndex ? { ...row, [action.columnId]: action.value } : row,
        ),
        dirty: true,
        saveStatus: 'idle',
      };

    case 'ROWS_DELETED': {
      const toRemove = new Set(action.rowIndexes);
      return {
        ...state,
        data: state.data.filter((_, i) => !toRemove.has(i)),
        dirty: true,
        saveStatus: 'idle',
      };
    }

    case 'SAVE_STARTED':
      return { ...state, saveStatus: 'saving', error: null };

    // Still dirty if the user kept editing while the save was in flight
    case 'SAVE_SUCCEEDED':
      return {
        ...state,
        dirty: state.data !== action.savedData,
        saveStatus: 'saved',
      };

    case 'SAVE_FAILED':
      return { ...state, saveStatus: 'error', error: 'Could not save your changes.' };

    default:
      return state;
  }
}