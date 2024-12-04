import { readFileSync } from "fs";

// Find all X positions, and from each of these, step in all 8 directions to find M, A, S

// Remember to check that the position after the step is still within the word search grid
// /!\ There can be multiple XMASs from a single X !

interface Point {
	x: number;
	y: number;
}

function xmasSearch(inputFile: string) {
	const input = readFileSync(`src/day4/${inputFile}`).toString();

	const inputLines = input.split(/[\r]*[\n]+/).filter((l) => l.length > 0);

	let xmasCount = 0;

	const xPositions = findAllXPos(inputLines);

	for (const xPos of xPositions) {
		xmasCount += findXmasFromX(inputLines, xPos);
	}

	console.log("XMAS count", xmasCount);
}

function findAllXPos(wordSearch: string[]): Point[] {
	const lineWidth = wordSearch[0].length;

	const xPos: Point[] = [];

	for (let y = 0; y < wordSearch.length; y++) {
		for (let x = 0; x < lineWidth; x++) {
			if (wordSearch[y][x] == "X") {
				xPos.push({ x, y });
			}
		}
	}

	return xPos;
}

function findXmasFromX(wordSearch: string[], xPos: Point): number {
	const lineWidth = wordSearch[0].length;

	const validPos = (pos: Point) => pos.x >= 0 && pos.x < lineWidth && pos.y >= 0 && pos.y < wordSearch.length;

	// Try stepping in all these directions to find XMAS
	const searchDirections: Point[] = [
		{ x: 1, y: 0 }, // Right
		{ x: 1, y: 1 }, // Down right
		{ x: 0, y: 1 }, // Down
		{ x: -1, y: 1 }, // Down left
		{ x: -1, y: 0 }, // Left
		{ x: -1, y: -1 }, // Up left
		{ x: 0, y: -1 }, // Up
		{ x: 1, y: -1 }, // Up right
	];

	const xmas = "XMAS";
	let xmasCount = 0;

	for (const searchDir of searchDirections) {
		let searchPos = xPos;
		for (let i = 0; i < xmas.length; i++) {
			if (!validPos(searchPos)) continue;

			const currentLetter = wordSearch[searchPos.y][searchPos.x];

			// If letter does not match XMAS, abort
			if (currentLetter != xmas[i]) break;

			// Correct letter
			if (i == xmas.length - 1) {
				// End of XMAS : success !

				xmasCount++;
			} else {
				// Keep searching, step in search direction
				searchPos = { x: searchPos.x + searchDir.x, y: searchPos.y + searchDir.y };
			}
		}
	}

	return xmasCount;
}

// xmasSearch("input_test_small");
// xmasSearch("input_test_stripped");
// xmasSearch("input_test");
xmasSearch("input");
