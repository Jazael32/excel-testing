// components/UploadExcel.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseExcelAdvanced } from "../lib/excelParserAdvanced";
import { saveDataset } from "@/app/actions/datasets";

export function UploadExcel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // pass sheetName / headerKeyword / stopOnEmptyColumn here as you do today
      const { headers, data } = await parseExcelAdvanced(file);
      const { id } = await saveDataset(file.name, headers, data);
      router.push(`/datasets/${id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleChange} disabled={loading} />
  );
}