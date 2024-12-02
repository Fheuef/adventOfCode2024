import { readFileSync } from "fs";

function safeReports(inputFile: string) {
	const input = readFileSync(`src/day2/${inputFile}`).toString();

	const inputLines = input.split(/[\r]*[\n]+/);

	let safeReports = 0;

	for (const report of inputLines) {
		if (report.length == 0) continue;

		const levels = reportFromString(report);

		const reportSafe = isReportSafe(levels);

		// Safe without change
		if (!Array.isArray(reportSafe)) {
			if (reportSafe) {
				safeReports++;
			}
			continue;
		}

		// Try with Problem Dampener using error indices
		const errorIndices: number[] = reportSafe;

		if (isReportSafeWithDampenedIndices(levels, errorIndices)) {
			safeReports++;
		}
	}

	console.log("Safe reports", safeReports);
}

function reportFromString(reportStr: string): number[] {
	if (reportStr.length == 0) throw new Error("Empty report");

	return reportStr.split(/ +/).map((n) => parseInt(n, 10));
}

/**
 * Returns true if a report is safe, otherwise returns the indices of levels that
 * could probably be removed by the Dampener to make it safe
 */
function isReportSafe(levels: number[]): number[] | boolean {
	const maxDiff = 3;

	if (levels.length == 1) return false;

	const ascending = levels[1] > levels[0];

	for (let i = 1; i < levels.length; i++) {
		// No increase or decrease => unsafe report
		if (levels[i] == levels[i - 1]) return [i - 1, i];

		const currentAscending = levels[i] > levels[i - 1];

		// Different direction
		if (currentAscending != ascending) return [0, i - 1, i];

		// Too much change
		if (Math.abs(levels[i] - levels[i - 1]) > maxDiff) {
			return [i - 1, i];
		}
	}

	// Everything ok, safe report
	return true;
}

/**
 * Tries to validate the report by removing one level from the indices list
 */
function isReportSafeWithDampenedIndices(levels: number[], errorIndices: number[]): boolean {
	for (const errorIndex of errorIndices) {
		const dampenedLevels = [...levels];
		dampenedLevels.splice(errorIndex, 1);

		if (isReportSafe(dampenedLevels) === true) {
			// Dampener success !
			return true;
		}
	}

	return false;
}

// safeReports("input_test.txt");
safeReports("input");
