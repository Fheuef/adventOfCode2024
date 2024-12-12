// Need to count the number of sides.
// I'm thinking maybe when exploring I can see whether a plant is on a border
// 4 booleans : {top, bottom, left, right}
// Share that to the next exploring step
// When gaining a new border, that's a new side ?

// Problem: Corners can be counted twice

// Struggled a lot with this one, seemed like it shouldn't be too complicated
// and I ended up trying a few things
// Final solution: when counting a plant's borders, sweep across the whole
// row/column to mark this side while the next plant has a border on the same side
// Only count a new side if it wasn't marked before

// I really don't like this solution, it feels too complicated and I feel there
// should be something more elegant, but hey at least it works

import { readFileSync } from "fs";

interface Point {
	x: number;
	y: number;
}

class PlantsRegion {
	sides: number = 0;
	area: number = 0;

	constructor(public type: string) {}

	get price() {
		return this.area * this.sides;
	}
}

interface PlantBorders {
	top?: boolean;
	bottom?: boolean;
	left?: boolean;
	right?: boolean;
}

function createMatrix<T>(width: number, height: number, defaultValue: T | (() => T)): T[][] {
	if (typeof defaultValue == "function") {
		const defaultFunc = defaultValue as () => T;
		return [...Array(height)].map((_) => [...Array(width)].map((_) => defaultFunc()));
	}
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

	isWithinRegion({ x, y }: Point, region: PlantsRegion): boolean {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
		return this.plantsMap[y][x] == region.type;
	}

	getRegions(): PlantsRegion[] {
		const regions: PlantsRegion[] = [];
		const explored = createMatrix(this.width, this.height, false);
		const sidesMap: PlantBorders[][] = createMatrix(this.width, this.height, () => ({}));

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (explored[y][x]) continue;

				const newRegion = new PlantsRegion(this.plantsMap[y][x]);
				regions.push(newRegion);
				this.exploreRegion(newRegion, { x, y }, explored, sidesMap);
			}
		}

		return regions;
	}

	exploreRegion(
		region: PlantsRegion,
		{ x, y }: { x: number; y: number },
		explored: boolean[][],
		sidesMap: PlantBorders[][]
	) {
		if (!this.isWithinRegion({ x, y }, region)) {
			return;
		}

		if (explored[y][x]) return;

		explored[y][x] = true;
		region.area++;

		const borders: PlantBorders = {
			top: !this.isWithinRegion({ x: x, y: y - 1 }, region),
			bottom: !this.isWithinRegion({ x: x, y: y + 1 }, region),
			left: !this.isWithinRegion({ x: x - 1, y: y }, region),
			right: !this.isWithinRegion({ x: x + 1, y: y }, region),
		};

		if (borders.top && !sidesMap[y][x].top) {
			region.sides++;
			this.sweepSide({ x, y }, "top", sidesMap, region);
		}
		if (borders.bottom && !sidesMap[y][x].bottom) {
			region.sides++;
			this.sweepSide({ x, y }, "bottom", sidesMap, region);
		}
		if (borders.left && !sidesMap[y][x].left) {
			region.sides++;
			this.sweepSide({ x, y }, "left", sidesMap, region);
		}
		if (borders.right && !sidesMap[y][x].right) {
			region.sides++;
			this.sweepSide({ x, y }, "right", sidesMap, region);
		}

		this.exploreRegion(region, { x: x, y: y - 1 }, explored, sidesMap);
		this.exploreRegion(region, { x: x, y: y + 1 }, explored, sidesMap);
		this.exploreRegion(region, { x: x - 1, y: y }, explored, sidesMap);
		this.exploreRegion(region, { x: x + 1, y: y }, explored, sidesMap);
	}

	sweepSide(
		{ x, y }: { x: number; y: number },
		side: keyof PlantBorders,
		sidesMap: PlantBorders[][],
		region: PlantsRegion
	) {
		if (!this.isWithinRegion({ x, y }, region)) return;
		if (sidesMap[y][x][side]) return;

		if (side == "top" && this.isWithinRegion({ x: x, y: y - 1 }, region)) return;
		if (side == "bottom" && this.isWithinRegion({ x: x, y: y + 1 }, region)) return;
		if (side == "left" && this.isWithinRegion({ x: x - 1, y: y }, region)) return;
		if (side == "right" && this.isWithinRegion({ x: x + 1, y: y }, region)) return;

		sidesMap[y][x][side] = true;

		if (side == "top" || side == "bottom") {
			this.sweepSide({ x: x - 1, y: y }, side, sidesMap, region);
			this.sweepSide({ x: x + 1, y: y }, side, sidesMap, region);
			return;
		}

		if (side == "left" || side == "right") {
			this.sweepSide({ x: x, y: y - 1 }, side, sidesMap, region);
			this.sweepSide({ x: x, y: y + 1 }, side, sidesMap, region);
			return;
		}
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

// gardenRegions("input_test1"); // Total 80
// gardenRegions("input_test2"); // Total 436
// gardenRegions("input_test3"); // Total 1206
// gardenRegions("input_testE"); // Total 236
// gardenRegions("input_test4"); // Total 368

gardenRegions("input");
