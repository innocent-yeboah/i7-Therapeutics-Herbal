"use client";

type CsvRow = Record<string, string | number | null | undefined>;

export function ExportCsvButton({
  filename,
  rows,
  columns,
}: {
  filename: string;
  rows: CsvRow[];
  columns: { key: string; header: string }[];
}) {
  function exportCsv() {
    const header = columns.map((c) => c.header).join(",");
    const body = rows
      .map((row) =>
        columns
          .map((c) => {
            const val = row[c.key];
            const str = val == null ? "" : String(val);
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportCsv}
      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
    >
      Export CSV
    </button>
  );
}
