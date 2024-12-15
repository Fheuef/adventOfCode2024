// Mostly straightforward, stealing some code from day 6 for directions, grid map
// and shit

// First insight: pushing a line of boxes is equivalent to teleporting the
// first box to the end of the line (sounds easy enough with a lil recursive
// walker thing)

import { readFileSync } from "fs";

enum CellType {
	EMPTY,
	WALL,
	BOX,
}

const directionsList = ["^", ">", "<", "v"] as const;

type Direction = (typeof directionsList)[number];

interface Vec2Like {
	x: number;
	y: number;
}

class Vec2 {
	/**
	 * a + b
	 */
	static add(a: Vec2Like, b: Vec2Like): Vec2Like {
		return { x: a.x + b.x, y: a.y + b.y };
	}

	/**
	 * a - b
	 */
	static sub(a: Vec2Like, b: Vec2Like): Vec2Like {
		return { x: a.x - b.x, y: a.y - b.y };
	}

	/**
	 * a * n
	 */
	static scale(a: Vec2Like, n: number): Vec2Like {
		return { x: a.x * n, y: a.y * n };
	}

	/**
	 * f(a)
	 */
	static apply(vec: Vec2Like, f: (n: number) => number) {
		return { x: f(vec.x), y: f(vec.y) };
	}

	static directionMap: Record<Direction, Vec2Like> = {
		"^": { x: 0, y: -1 },
		">": { x: 1, y: 0 },
		v: { x: 0, y: 1 },
		"<": { x: -1, y: 0 },
	};

	static fromDirection(dir: Direction): Vec2Like {
		return this.directionMap[dir];
	}

	static toString(v: Vec2Like) {
		return `(${v.x}, ${v.y})`;
	}

	static equals(a: Vec2Like, b: Vec2Like): boolean {
		return a.x == b.x && a.y == b.y;
	}
}

class Warehouse {
	map: CellType[][];
	robot: Vec2Like;

	constructor(width: number, height: number) {
		this.map = [...Array(height)].map((_) => Array(width).fill(CellType.EMPTY));
	}

	get width(): number {
		return this.map.length;
	}

	public get height(): number {
		return this.map[0]?.length || 0;
	}

	nextPosInDir(pos: Vec2Like, dir: Direction): Vec2Like {
		const dirVec = Vec2.fromDirection(dir);
		return Vec2.add(pos, dirVec);
	}

	moveRobot(dir: Direction) {
		const nextPos = this.nextPosInDir(this.robot, dir);

		this.pushBox(nextPos, dir);

		if (this.map[nextPos.y][nextPos.x] == CellType.EMPTY) {
			this.robot = { ...nextPos };
		}
	}

	moveRobotBatch(directions: Direction[]) {
		for (const dir of directions) {
			this.moveRobot(dir);

			// console.log("Moving", dir);
			// console.log(this.toString());
			// console.log();
		}
	}

	pushBox(pos: Vec2Like, dir: Direction) {
		if (this.map[pos.y][pos.x] != CellType.BOX) return;

		const nextEmptySpace = this.nextEmptySpace(pos, dir);

		if (!nextEmptySpace) return;

		this.map[nextEmptySpace.y][nextEmptySpace.x] = CellType.BOX;
		this.map[pos.y][pos.x] = CellType.EMPTY;
	}

	nextEmptySpace(pos: Vec2Like, dir: Direction): Vec2Like | undefined {
		if (this.map[pos.y][pos.x] == CellType.EMPTY) {
			return pos;
		}

		if (this.map[pos.y][pos.x] == CellType.WALL) {
			return undefined;
		}

		return this.nextEmptySpace(this.nextPosInDir(pos, dir), dir);
	}

	gpsSum(): number {
		let sum = 0;

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.map[y][x] == CellType.BOX) {
					sum += 100 * y + x;
				}
			}
		}

		return sum;
	}

	toString() {
		const mapStrLines: string[][] = this.map.map((cellLine) =>
			cellLine.map((cell) => {
				switch (cell) {
					case CellType.WALL:
						return "#";
					case CellType.BOX:
						return "O";

					default:
						return ".";
				}
			})
		);

		mapStrLines[this.robot.y][this.robot.x] = "@";

		return mapStrLines.map((line) => line.join("")).join("\n");
	}

	static fromString(warehouseStr: string): Warehouse {
		const inputLines = warehouseStr.trim().split(/\r?\n/);

		const height = inputLines.length;
		const width = inputLines[0].length;

		const warehouse = new Warehouse(width, height);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const char = inputLines[y][x];

				switch (char) {
					case "#":
						warehouse.map[y][x] = CellType.WALL;
						break;
					case "O":
						warehouse.map[y][x] = CellType.BOX;
						break;
					case "@":
						warehouse.robot = { x, y };
						break;
				}
			}
		}

		return warehouse;
	}
}

async function warehouseBot(inputFile: string) {
	const input = readFileSync(`src/day15/${inputFile}`).toString();

	const inputSplit = input.split(/(\r?\n){2}/g);

	const warehouseStr = inputSplit[0];
	const warehouse = Warehouse.fromString(warehouseStr);

	const robotMoves = [...inputSplit[2].trim().replaceAll(/\r?\n/g, "")] as Direction[];

	console.log(warehouse.toString());
	// console.log(robotMoves);

	warehouse.moveRobotBatch(robotMoves);
	console.log(warehouse.toString());

	const gpsSum = warehouse.gpsSum();
	console.log("GPS Sum", gpsSum);
}

// warehouseBot("input_testSmol");
// warehouseBot("input_testLarge");
warehouseBot("input");
