import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { historyDir } from "./paths";
import { EvaluationReportSchema, type EvaluationReport } from "./types";

const HISTORY_CAP = 50;

export async function saveReport(report: EvaluationReport): Promise<void> {
  const dir = historyDir();
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${report.id}.json`);
  await writeFile(path, JSON.stringify(report, null, 2), "utf8");
  await trimHistory();
}

export async function listReports(): Promise<EvaluationReport[]> {
  const dir = historyDir();
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const reports: EvaluationReport[] = [];
  for (const file of files) {
    try {
      const raw = await readFile(join(dir, file), "utf8");
      reports.push(EvaluationReportSchema.parse(JSON.parse(raw)));
    } catch {
      // skip corrupt entries
    }
  }
  return reports.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, HISTORY_CAP);
}

export async function getReport(id: string): Promise<EvaluationReport | null> {
  try {
    const raw = await readFile(join(historyDir(), `${id}.json`), "utf8");
    return EvaluationReportSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function deleteReport(id: string): Promise<void> {
  try {
    await unlink(join(historyDir(), `${id}.json`));
  } catch {
    // already gone
  }
}

async function trimHistory(): Promise<void> {
  const reports = await listReports();
  if (reports.length <= HISTORY_CAP) return;
  const extra = reports.slice(HISTORY_CAP);
  await Promise.all(extra.map((r) => deleteReport(r.id)));
}
