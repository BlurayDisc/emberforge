import type { Command } from '../gameStore';

export function dismissReportCommand(runNumber: number): Command {
  return (state) => ({ ...state, reports: state.reports.filter((report) => report.runNumber !== runNumber) });
}

export function dismissAllReportsCommand(): Command {
  return (state) => ({ ...state, reports: [] });
}
