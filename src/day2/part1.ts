import { readFileSync } from "fs";

function safeReports(inputFile: string) {
	const input = readFileSync(`src/day2/${inputFile}`).toString();

	const inputLines = input.split(/[\r]*[\n]+/);

	let safeReports = 0;

	for (const report of inputLines) {
		if (report.length == 0) continue;

		if (isReportSafe(report)) {
			safeReports++;
		}
	}

	console.log("Safe reports", safeReports);
}

function isReportSafe(report: string): boolean {
	if (report.length == 0) throw new Error("Empty report");

	const maxDiff = 3;

	const levels = report.split(" ").map((n) => parseInt(n, 10));

	if (levels.length == 1) return true;

	const ascending = levels[1] > levels[0];

	for (let i = 1; i < levels.length; i++) {
		// No increase or decrease => unsafe report
		if (levels[i] == levels[i - 1]) return false;

		const currentAscending = levels[i] > levels[i - 1];

		// different direction
		if (currentAscending != ascending) return false;

		// Too much change
		if (Math.abs(levels[i] - levels[i - 1]) > maxDiff) {
			return false;
		}
	}

	// Everything ok, safe report
	return true;
}

// safeReports("input_test.txt");
safeReports("input");
