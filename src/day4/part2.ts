import { readFileSync } from "fs";

// This time, start by finding all A positions
// Do mostly the same thing with a few differences
// - From the A, take a step back opposite of the search direction, to find the M
// - Look for MAS instead of XMAS
// - Increment X-MAS count when you find 2 MAS from the same A

interface Point {
	x: number;
	y: number;
}

function xmasSearch(inputFile: string) {
	const input = readFileSync(`src/day4/${inputFile}`).toString();

	const inputLines = input.split(/[\r]*[\n]+/).filter((l) => l.length > 0);

	let xmasCount = 0;

	const aPositions = findAllAPos(inputLines);

	for (const aPos of aPositions) {
		if (findMasFromA(inputLines, aPos) == 2) xmasCount++;
	}

	console.log("X-MAS count", xmasCount);
}

function findAllAPos(wordSearch: string[]): Point[] {
	const lineWidth = wordSearch[0].length;

	const aPos: Point[] = [];

	for (let y = 0; y < wordSearch.length; y++) {
		for (let x = 0; x < lineWidth; x++) {
			if (wordSearch[y][x] == "A") {
				aPos.push({ x, y });
			}
		}
	}

	return aPos;
}

function findMasFromA(wordSearch: string[], aPos: Point): number {
	const lineWidth = wordSearch[0].length;

	const validPos = (pos: Point) => pos.x >= 0 && pos.x < lineWidth && pos.y >= 0 && pos.y < wordSearch.length;

	// Try stepping in all these directions to find MAS
	const searchDirections: Point[] = [
		{ x: 1, y: 1 }, // Down right
		{ x: -1, y: 1 }, // Down left
		{ x: -1, y: -1 }, // Up left
		{ x: 1, y: -1 }, // Up right
	];

	const mas = "MAS";
	let masCount = 0;

	for (const searchDir of searchDirections) {
		// First take a step back, to land on the M
		let searchPos = { x: aPos.x - searchDir.x, y: aPos.y - searchDir.y };

		for (let i = 0; i < mas.length; i++) {
			if (!validPos(searchPos)) continue;

			const currentLetter = wordSearch[searchPos.y][searchPos.x];

			// If letter does not match MAS, abort
			if (currentLetter != mas[i]) break;

			// Correct letter
			if (i == mas.length - 1) {
				// End of MAS : success !
				masCount++;
			} else {
				// Keep searching, step in search direction
				searchPos = { x: searchPos.x + searchDir.x, y: searchPos.y + searchDir.y };
			}
		}
	}

	return masCount;
}

// xmasSearch("input_test");
xmasSearch("input");
