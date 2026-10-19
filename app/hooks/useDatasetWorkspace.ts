'use client';

import { useCallback, useEffect, useReducer, useRef, type ChangeEvent } from 'react';
import { parseExcelAdvanced } from '../lib/excelParserAdvanced';
import {
  saveDataset,
  getDataset,
  listDatasets,
  deleteDataset,
  updateRows,
} from '../actions/datasets';
import { datasetReducer, initialDatasetState } from './datasetReducer';

// Configuración del parser: un solo lugar para cambiarla
const HEADER_KEYWORD = 'C.A.';
const STOP_ON_EMPTY_COLUMN = 'C.A.';

export function useDatasetWorkspace() {

  const [state, dispatch] = useReducer(datasetReducer, initialDatasetState);

  const refreshSaved = useCallback(async () => {
    try {
      dispatch({ type: 'SAVED_LIST_LOADED', saved: await listDatasets() });
    } catch (err) {
      console.error('Error loading saved datasets', err);
    }
  }, []);

  const saveChanges = useCallback(async () => {
    if (!state.currentId || !state.dirty) return;

    const savedData = state.data;
    dispatch({ type: 'SAVE_STARTED' });
    try {
      await updateRows(state.currentId, savedData);
      dispatch({ type: 'SAVE_SUCCEEDED', savedData });
      refreshSaved(); // updates the "last modified" date in the list
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SAVE_FAILED' });
    }
  }, [state.currentId, state.dirty, state.data, refreshSaved]);

  // Ctrl/Cmd + S saves
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveChanges();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveChanges]);

  // Warn before closing the tab with unsaved edits (keep the one you already have)
  useEffect(() => {
    if (!state.dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.dirty]);

  // Before replacing the table on screen, make sure the user accepts losing unsaved edits
  const confirmDiscard = useCallback(
    () => !state.dirty || window.confirm('You have unsaved changes. Discard them?'),
    [state.dirty],
  );

  // Warn before closing the tab with unsaved edits
  useEffect(() => {
    if (!state.dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.dirty]);

  const editCell = useCallback(
    (rowIndex: number, columnId: string, value: unknown) =>
      dispatch({ type: 'CELL_EDITED', rowIndex, columnId, value }),
    [],
  );

  const deleteRows = useCallback(
    (rowIndexes: number[]) => dispatch({ type: 'ROWS_DELETED', rowIndexes }),
    [],
  );

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const onFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0];
      if (!file) return;
      if (!confirmDiscard()) {
        input.value = '';
        return;
      }

      dispatch({ type: 'LOADING', value: true });
      try {
        const result = await parseExcelAdvanced(
          file,
          undefined,
          HEADER_KEYWORD,
          STOP_ON_EMPTY_COLUMN,
        );

        // La tabla se muestra de inmediato
        dispatch({ type: 'TABLE_PARSED', headers: result.headers, data: result.data });

        // Y se guarda en la base de datos
        try {
          const { id } = await saveDataset(file.name, result.headers, result.data);
          dispatch({ type: 'TABLE_SAVED', id });
          await refreshSaved();
        } catch (saveErr) {
          console.error(saveErr);
          dispatch({
            type: 'ERROR',
            message: 'The file was parsed, but it could not be saved to the database.',
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({ type: 'ERROR', message: 'Error parsing Excel file.' });
      } finally {
        dispatch({ type: 'LOADING', value: false });
        input.value = ''; // permite volver a subir el mismo archivo
      }
    },
    [refreshSaved],
  );

  const openDataset = useCallback(
    async (id: string) => {
      if (!confirmDiscard()) return;
      dispatch({ type: 'LOADING', value: true });
      dispatch({ type: 'ERROR', message: null });
      try {
        const dataset = await getDataset(id);
        if (!dataset) {
          dispatch({ type: 'ERROR', message: 'Dataset not found.' });
          await refreshSaved();
          return;
        }
        dispatch({
          type: 'TABLE_OPENED',
          id: dataset.id,
          headers: dataset.columns,
          data: dataset.rows,
        });
      } catch (err) {
        console.error(err);
        dispatch({ type: 'ERROR', message: 'Error loading the saved table.' });
      } finally {
        dispatch({ type: 'LOADING', value: false });
      }
    },
    [refreshSaved],
  );

  const removeDataset = useCallback(
    async (id: string) => {
      try {
        await deleteDataset(id);
        if (id === state.currentId) dispatch({ type: 'TABLE_CLEARED' });
        await refreshSaved();
      } catch (err) {
        console.error(err);
        dispatch({ type: 'ERROR', message: 'Error deleting the table.' });
      }
    },
    [state.currentId, refreshSaved],
  );

  return {
    ...state,
    onFileChange,
    openDataset,
    removeDataset,
    editCell,
    deleteRows,
    saveChanges,
  };
}