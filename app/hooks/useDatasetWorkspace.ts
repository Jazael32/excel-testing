'use client';

import { useCallback, useEffect, useReducer, type ChangeEvent } from 'react';
import { parseExcelAdvanced } from '../lib/excelParserAdvanced';
import {
  saveDataset,
  getDataset,
  listDatasets,
  deleteDataset,
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

  useEffect(() => {
    refreshSaved();
  }, [refreshSaved]);

  const onFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const file = input.files?.[0];
      if (!file) return;

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

  return { ...state, onFileChange, openDataset, removeDataset };
}