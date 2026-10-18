export type Row = Record<string, any>;
export type SavedItem = { id: string; name: string; updatedAt: number };

export interface DatasetState {
  headers: string[];
  data: Row[];
  currentId: string | null;
  saved: SavedItem[];
  loading: boolean;
  error: string | null;
}

export const initialDatasetState: DatasetState = {
  headers: [],
  data: [],
  currentId: null,
  saved: [],
  loading: false,
  error: null,
};

export type DatasetAction =
  | { type: 'LOADING'; value: boolean }
  | { type: 'ERROR'; message: string | null }
  | { type: 'SAVED_LIST_LOADED'; saved: SavedItem[] }
  | { type: 'TABLE_PARSED'; headers: string[]; data: Row[] }
  | { type: 'TABLE_SAVED'; id: string }
  | { type: 'TABLE_OPENED'; id: string; headers: string[]; data: Row[] }
  | { type: 'TABLE_CLEARED' };

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
      };

    case 'TABLE_SAVED':
      return { ...state, currentId: action.id };

    case 'TABLE_OPENED':
      return {
        ...state,
        headers: action.headers,
        data: action.data,
        currentId: action.id,
        error: null,
      };

    case 'TABLE_CLEARED':
      return { ...state, headers: [], data: [], currentId: null };

    default:
      return state;
  }
}