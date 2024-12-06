import { readFileSync } from "fs";

enum CellType {
	EMPTY,
	OBSTACLE,
	VISITED,
}

interface Point {
	x: number;
	y: number;
}

const directionsList = ["^", ">", "<", "V"] as const;

type Direction = (typeof directionsList)[number];

interface Guard {
	position: Point;
	direction: Direction;
}

function nextPosInDirection({ x, y }: Point, direction: Direction) {
	switch (direction) {
		case "^":
			return { x: x, y: y - 1 };
		case ">":
			return { x: x + 1, y: y };
		case "<":
			return { x: x - 1, y: y };
		case "V":
			return { x: x, y: y + 1 };
	}
}

function rotateDirection(direction: Direction, clockWise = true): Direction {
	switch (direction) {
		case "^":
			return ">";
		case ">":
			return "V";
		case "<":
			return "^";
		case "V":
			return "<";
	}
}

class LabMap {
	map: CellType[][];
	guard: Guard = { position: { x: 0, y: 0 }, direction: "^" };

	constructor(width: number, height: number) {
		this.map = Array(height);
		for (let i = 0; i < height; i++) {
			this.map[i] = Array(width).fill(CellType.EMPTY);
		}
	}

	get width(): number {
		return this.map.length;
	}

	public get height(): number {
		return this.map[0]?.length || 0;
	}

	isValid(pos: Point): boolean {
		return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
	}

	getCell(x: number, y: number): CellType | undefined {
		if (!this.isValid({ x, y })) return;
		return this.map[y][x];
	}

	setCell(x: number, y: number, type: CellType) {
		if (!this.isValid({ x, y })) return;
		this.map[y][x] = type;
	}

	isGuardInLab() {
		return this.isValid(this.guard.position);
	}

	stepGuard() {
		const nextPos = nextPosInDirection(this.guard.position, this.guard.direction);

		if (this.getCell(nextPos.x, nextPos.y) == CellType.OBSTACLE) {
			this.guard.direction = rotateDirection(this.guard.direction);
		} else {
			this.guard.position = nextPos;
			this.setCell(nextPos.x, nextPos.y, CellType.VISITED);
		}
	}

	async stepGuardUntilExit(printDelay?: number) {
		while (this.isGuardInLab()) {
			this.stepGuard();

			if (printDelay != undefined) {
				console.log(this.toString());
				console.log();

				if (printDelay > 0) {
					await new Promise((res) => setTimeout(res, printDelay));
				}
			}
		}
	}

	toString() {
		const mapStrLines: string[] = this.map.map((cellLine) =>
			cellLine
				.map((cell) => {
					switch (cell) {
						case CellType.OBSTACLE:
							return "#";
						case CellType.VISITED:
							return "X";

						default:
							return ".";
					}
				})
				.join("")
		);

		// Replace with guard at guard pos
		if (this.isGuardInLab()) {
			const gx = this.guard.position.x;
			const gy = this.guard.position.y;
			mapStrLines[gy] =
				mapStrLines[gy].substring(0, gx) + this.guard.direction + mapStrLines[gy].substring(gx + 1);
		}

		return mapStrLines.join("\n");
	}
}

async function guardPatrol(inputFile: string) {
	const input = readFileSync(`src/day6/${inputFile}`).toString();

	const inputLines = input.split(/[\r]*[\n]/).filter((l) => l.length > 0);

	const height = inputLines.length;
	const width = inputLines[0].length;

	const labMap = new LabMap(width, height);

	// Read map
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const cell = inputLines[y][x];
			if (cell == ".") continue;

			if (cell == "#") {
				labMap.setCell(x, y, CellType.OBSTACLE);
			} else if (directionsList.includes(cell as Direction)) {
				labMap.guard.position = { x, y };
				labMap.setCell(x, y, CellType.VISITED);
			}
		}
	}

	// Animate guard
	// await labMap.stepGuardUntilExit(700);

	await labMap.stepGuardUntilExit();

	let visitedCount = (labMap.map.flat().map((cell) => (cell == CellType.VISITED ? 1 : 0)) as number[]).reduce(
		(val, acc) => acc + val
	);

	console.log("Visited positions", visitedCount);
}

// guardPatrol("input_test");
guardPatrol("input");
