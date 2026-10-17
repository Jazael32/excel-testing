"use server";
import { db } from "@/src/prisma/db";

const Dataset = db.orm.public.Dataset;

export async function saveDataset(
  name: string,
  columns: string[],
  rows: Record<string, unknown>[],
) {
  const created = await Dataset.create({ name, columns, rows });
  return { id: created.id };
}

export async function getDataset(id: number) {
  return Dataset.where({ id }).first(); // null si no existe
}

export async function updateRows(id: number, rows: Record<string, unknown>[]) {
  await Dataset.where({ id }).update({ rows });
}

export async function deleteDataset(id: number) {
  await Dataset.where({ id }).delete();
}

export async function listDatasets() {
  const list = await Dataset
    .select("id", "name", "updatedAt")
    .orderBy((d) => d.updatedAt.desc())
    .all();

  // Temporal.Instant no se puede enviar a un Client Component, lo paso a número
  return list.map((d) => ({
    id: d.id,
    name: d.name,
    updatedAt: d.updatedAt.epochMilliseconds,
  }));
}