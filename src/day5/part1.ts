// Read all ordering rules, and each page update.
// For each update, check each rule : fails if first page is found before 2nd page

// Ended up doing it all with array functions

import { readFileSync } from "fs";

interface OrderRule {
	first: number;
	second: number;
}

function pageOrdering(inputFile: string) {
	const input = readFileSync(`src/day5/${inputFile}`).toString();

	const inputLines = input.split(/[\r]*[\n]/);

	// The empty line separating ordering rules and updates
	let dataSeparator = inputLines.findIndex((line) => line.length == 0);

	// Read order rules
	const orderRules: OrderRule[] = inputLines.slice(0, dataSeparator).map((line) => {
		const lineValues = line.split("|");
		return { first: parseInt(lineValues[0]), second: parseInt(lineValues[1]) };
	});

	// Read page updates
	const pageUpdates: number[][] = inputLines
		.slice(dataSeparator + 1)
		.filter((l) => l.length > 0)
		.map((line) => line.split(",").map((c) => parseInt(c)));

	// console.log("Ordering rules", orderRules);
	// console.log("Page updates", pageUpdates);

	const validUpdates = findValidUpdates(orderRules, pageUpdates);
	const middlePages = validUpdates.map((pages) => pages[Math.floor(pages.length / 2)]);

	console.log("Valid updates", validUpdates);
	console.log("Middle pages", middlePages);

	const middleSum = middlePages.reduce((val, acc) => acc + val);
	console.log("Sum of middle pages", middleSum);
}

function findValidUpdates(orderRules: OrderRule[], pageUpdates: number[][]) {
	const isValid = (pageUpdate: number[]): boolean => {
		for (const rule of orderRules) {
			const firstPage = pageUpdate.findIndex((page) => page == rule.first);
			if (firstPage == -1) continue;

			const secondPage = pageUpdate.findIndex((page) => page == rule.second);
			if (secondPage == -1) continue;

			if (firstPage > secondPage) return false;
		}

		return true;
	};

	return pageUpdates.filter(isValid);
}

// pageOrdering("input_test");
pageOrdering("input");
