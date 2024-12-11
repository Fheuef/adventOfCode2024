// Oh shit ! Part 2 is literally done already ! I just have to remove the de-duplication part !

// h e l l   y e a

import { readFileSync } from "fs";

interface Point {
	x: number;
	y: number;
}

class TrailMap {
	heightMap: number[][] = [];

	constructor(public width: number, public height: number) {
		this.heightMap = [...Array(height)].map((_) => Array(width).fill(-1));
	}

	isWithinMap(pos: Point): boolean {
		return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
	}

	sumTrailHeadScores(): number {
		let scoreSum = 0;

		const trailheads = this.findTrailHeads();

		for (const th of trailheads) {
			const pathsToMaxHeight = this.searchMaxHeightFromPos(th);
			scoreSum += pathsToMaxHeight.length;
		}

		return scoreSum;
	}

	/**
	 * From a given position, searches in all direction for the max height.
	 * Returns the number of max height positions reachable from here
	 */
	searchMaxHeightFromPos(pos: Point, fromHeight?: number): Point[] {
		// Outside map
		if (!this.isWithinMap(pos)) return [];

		const currentHeight = this.heightMap[pos.y][pos.x];

		// Needs to be previous height + 1
		if (fromHeight != undefined && currentHeight != fromHeight + 1) return [];

		// Success: Max height reached
		if (currentHeight == 9) {
			return [{ ...pos }];
		}

		// Recursive search
		const maxHeightPositions: Point[] = [];
		maxHeightPositions.push(...this.searchMaxHeightFromPos({ x: pos.x + 1, y: pos.y }, currentHeight));
		maxHeightPositions.push(...this.searchMaxHeightFromPos({ x: pos.x - 1, y: pos.y }, currentHeight));
		maxHeightPositions.push(...this.searchMaxHeightFromPos({ x: pos.x, y: pos.y + 1 }, currentHeight));
		maxHeightPositions.push(...this.searchMaxHeightFromPos({ x: pos.x, y: pos.y - 1 }, currentHeight));

		return maxHeightPositions;
	}

	findTrailHeads(): Point[] {
		const trailHeads: Point[] = [];

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.heightMap[y][x] === 0) {
					trailHeads.push({ x, y });
				}
			}
		}

		return trailHeads;
	}

	toString() {
		return this.heightMap
			.map((line) => line.map((posHeight) => (posHeight == -1 ? "." : posHeight.toString())).join(""))
			.join("\n");
	}

	static fromString(heightMap: string): TrailMap {
		const inputLines = heightMap.split(/[\r]*[\n]/).filter((l) => l.length > 0);

		const height = inputLines.length;
		const width = inputLines[0].length;

		const trailMap = new TrailMap(width, height);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const char = inputLines[y][x];

				const posheight = char == "." ? -1 : parseInt(char);
				trailMap.heightMap[y][x] = posheight;
			}
		}

		return trailMap;
	}
}

function hikingTrails(inputFile: string) {
	const input = readFileSync(`src/day10/${inputFile}`).toString().trim();

	const trailMap = TrailMap.fromString(input);
	console.log(trailMap.toString());

	console.log("Trailheads scores sum", trailMap.sumTrailHeadScores());
}

// hikingTrails("input_smallTest");
// hikingTrails("input_test");
hikingTrails("input");
