// First, filter out valid updates as we only want to sum the invalid ones.
// While an update is invalid, use the broken ordering rule to move the
// first number just before the second one.

// TIL : the splice function can be used to insert values at a given index,
// as well as removing a value.

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

	const fixedUpdates = fixInvalidUpdates(orderRules, pageUpdates);
	const middlePages = fixedUpdates.map((pages) => pages[Math.floor(pages.length / 2)]);

	const middleSum = middlePages.reduce((val, acc) => acc + val);
	console.log("Sum of middle pages", middleSum);
}

function fixInvalidUpdates(orderRules: OrderRule[], pageUpdates: number[][]) {
	// Returns true if the update is valid, else returns data about the broken rule
	const isValid = (pageUpdate: number[]) => {
		for (const rule of orderRules) {
			const firstPage = pageUpdate.findIndex((page) => page == rule.first);
			if (firstPage == -1) continue;

			const secondPage = pageUpdate.findIndex((page) => page == rule.second);
			if (secondPage == -1) continue;

			// Rule broken, return the index of the page that should be first and the
			// one that should be second
			if (firstPage > secondPage)
				return {
					firstIndex: firstPage,
					secondIndex: secondPage,
				};
		}

		return true;
	};

	const sortUpdate = (pageUpdate: number[]): number[] => {
		let invalidRes = isValid(pageUpdate);
		if (invalidRes === true) {
			return pageUpdate;
		}

		const fixedPageUpdate = [...pageUpdate];

		while (invalidRes !== true) {
			// Incorrect first index is removed and inserted before second index
			const firstPageVal = fixedPageUpdate[invalidRes.firstIndex];
			fixedPageUpdate.splice(invalidRes.firstIndex, 1);
			fixedPageUpdate.splice(invalidRes.secondIndex, 0, firstPageVal);

			invalidRes = isValid(fixedPageUpdate);
		}

		return fixedPageUpdate;
	};

	return pageUpdates.filter((update) => isValid(update) != true).map((update) => sortUpdate(update));
}

// pageOrdering("input_test");
pageOrdering("input");
