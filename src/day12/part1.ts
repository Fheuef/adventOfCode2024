// First thought: a primary loop that iterates through the garden map, every time
// it encounters a new type of plant it calls a function that recusively
// explores only this plant around that position.

// Slight problem with this, it might start exploring the same region twice.
// Can probably be avoided without changing too much by keeping track of which
// plants have been explored ?
// (Probably also means I don't have to care about finding a "new plant", the region
// will be explored completely before continuing the main loop)

// When exploring a region, you can simply add 1 to the area for each new plant,
// and add to the perimeter the number of neighbors that are not the same plant

// Works wells, no issues there !
// (I just hope part 2 won't ask to share a single fence between regions or something)

import { readFileSync } from "fs";

interface Point {
	x: number;
	y: number;
}

class PlantsRegion {
	perimeter: number = 0;
	area: number = 0;

	constructor(public type: string) {}

	get price() {
		return this.area * this.perimeter;
	}
}

function createMatrix<T>(width: number, height: number, defaultValue: T): T[][] {
	return [...Array(height)].map((_) => Array(width).fill(defaultValue));
}

class Garden {
	plantsMap: string[][];

	constructor(public width: number, public height: number) {
		this.plantsMap = createMatrix(width, height, "");
	}

	isWithinMap(pos: Point): boolean {
		return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
	}

	getRegions(): PlantsRegion[] {
		const regions: PlantsRegion[] = [];
		const explored = createMatrix(this.width, this.height, false);

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (explored[y][x]) continue;

				const newRegion = new PlantsRegion(this.plantsMap[y][x]);
				regions.push(newRegion);
				this.exploreRegion(newRegion, { x, y }, explored);
			}
		}

		return regions;
	}

	exploreRegion(region: PlantsRegion, { x, y }: { x: number; y: number }, explored: boolean[][]) {
		if (!this.isWithinMap({ x, y }) || this.plantsMap[y][x] != region.type) {
			region.perimeter++;
			return;
		}

		if (explored[y][x]) return;

		explored[y][x] = true;
		region.area++;

		this.exploreRegion(region, { x: x + 1, y: y }, explored);
		this.exploreRegion(region, { x: x - 1, y: y }, explored);
		this.exploreRegion(region, { x: x, y: y + 1 }, explored);
		this.exploreRegion(region, { x: x, y: y - 1 }, explored);
	}

	toString() {
		return this.plantsMap.map((line) => line.join("")).join("\n");
	}

	static fromString(heightMap: string): Garden {
		const inputLines = heightMap.trim().split(/[\r]*[\n]/);

		const height = inputLines.length;
		const width = inputLines[0].length;

		const garden = new Garden(width, height);

		for (let y = 0; y < height; y++) {
			garden.plantsMap[y] = [...inputLines[y]];
		}

		return garden;
	}
}

function gardenRegions(inputFile: string) {
	const input = readFileSync(`src/day12/${inputFile}`).toString();

	const garden = Garden.fromString(input);
	console.log(garden.toString());

	const regions = garden.getRegions();
	let totalPrice = 0;
	for (const region of regions) {
		totalPrice += region.price;
		console.log(region, "Price", region.price);
	}

	console.log("Total price", totalPrice);
}

// gardenRegions("input_test1"); // Total 140
// gardenRegions("input_test2"); // Total 772
// gardenRegions("input_test3"); // Total 1930

gardenRegions("input"); // Total 1930
