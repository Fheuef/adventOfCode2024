// Just gonna wing it at first after resizing the map and see what happens.
// Also gonna need to change my box moving logic.
// Need to push the boxes recursively, and handle vertical push differently
// as it needs to push on both the left and right halves of the box

// Well, that worked without too much trouble
// I used 2 completely different functions for pushing boxes horizontally or vertically

// Pushing horizontally is pretty much the same

// The main thing with pushing vertically is a recursive check to ensure that all
// boxes are pushable, before actually pushing

import { readFileSync } from "fs";

enum CellType {
	EMPTY,
	WALL,
	BOXL,
	BOXR,
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

	get height(): number {
		return this.map.length;
	}

	get width(): number {
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

	pushBox(pos: Vec2Like, dir: Direction): boolean {
		if (this.map[pos.y][pos.x] != CellType.BOXL && this.map[pos.y][pos.x] != CellType.BOXR) return false;

		const isHorizontal = dir == "<" || dir == ">";
		if (isHorizontal) {
			this.pushBoxHorizontal(pos, dir);
		} else {
			if (!this.canPushVertical(pos, dir)) return false;

			this.pushBoxVertical(pos, dir);
		}

		return true;
	}

	pushBoxHorizontal(pos: Vec2Like, dir: Direction) {
		// Abort if not a box
		if (this.map[pos.y][pos.x] != CellType.BOXL && this.map[pos.y][pos.x] != CellType.BOXR) return;

		// Make sure pos is the opposite side of the push
		if (dir == ">" && this.map[pos.y][pos.x] == CellType.BOXR) {
			pos = this.nextPosInDir(pos, "<");
		} else if (dir == "<" && this.map[pos.y][pos.x] == CellType.BOXL) {
			pos = this.nextPosInDir(pos, ">");
		}

		const otherBoxPos = this.nextPosInDir(pos, dir);
		const posBehindBox = this.nextPosInDir(otherBoxPos, dir);

		// Push next box first
		this.pushBoxHorizontal(posBehindBox, dir);

		const otherBoxType = this.map[otherBoxPos.y][otherBoxPos.x];
		const typeBehindBox = this.map[posBehindBox.y][posBehindBox.x];
		if (typeBehindBox == CellType.EMPTY) {
			// Moving box
			this.map[posBehindBox.y][posBehindBox.x] = otherBoxType;
			this.map[otherBoxPos.y][otherBoxPos.x] = this.map[pos.y][pos.x];
			this.map[pos.y][pos.x] = CellType.EMPTY;

			return;
		}

		return;
	}

	pushBoxVertical(pos: Vec2Like, dir: Direction) {
		// Abort if not a box
		if (this.map[pos.y][pos.x] != CellType.BOXL && this.map[pos.y][pos.x] != CellType.BOXR) return;

		// Make sure pos is left side
		if (this.map[pos.y][pos.x] == CellType.BOXR) {
			pos = this.nextPosInDir(pos, "<");
		}

		const leftPos = pos;
		const rightPos = this.nextPosInDir(leftPos, ">");

		const posBehindLeft = this.nextPosInDir(leftPos, dir);
		const posBehindRight = this.nextPosInDir(rightPos, dir);

		this.pushBoxVertical(posBehindLeft, dir);
		this.pushBoxVertical(posBehindRight, dir);

		// Push left side
		this.map[posBehindLeft.y][posBehindLeft.x] = this.map[leftPos.y][leftPos.x];
		this.map[leftPos.y][leftPos.x] = CellType.EMPTY;

		// Push right side
		this.map[posBehindRight.y][posBehindRight.x] = this.map[rightPos.y][rightPos.x];
		this.map[rightPos.y][rightPos.x] = CellType.EMPTY;
	}

	canPushVertical(pos: Vec2Like, dir: Direction): boolean {
		// Can push if empty
		if (this.map[pos.y][pos.x] == CellType.EMPTY) return true;

		// Abort if not a box
		if (this.map[pos.y][pos.x] != CellType.BOXL && this.map[pos.y][pos.x] != CellType.BOXR) return false;

		// Make sure pos is left side
		if (this.map[pos.y][pos.x] == CellType.BOXR) {
			pos = this.nextPosInDir(pos, "<");
		}

		const leftPos = pos;
		const rightPos = this.nextPosInDir(leftPos, ">");

		return (
			this.canPushVertical(this.nextPosInDir(leftPos, dir), dir) &&
			this.canPushVertical(this.nextPosInDir(rightPos, dir), dir)
		);
	}

	gpsSum(): number {
		let sum = 0;

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				if (this.map[y][x] == CellType.BOXL) {
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
					case CellType.BOXL:
						return "[";
					case CellType.BOXR:
						return "]";

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
		const width = inputLines[0].length * 2;

		const warehouse = new Warehouse(width, height);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const char = inputLines[y][x];

				switch (char) {
					case "#":
						warehouse.map[y][2 * x] = CellType.WALL;
						warehouse.map[y][2 * x + 1] = CellType.WALL;
						break;
					case "O":
						warehouse.map[y][2 * x] = CellType.BOXL;
						warehouse.map[y][2 * x + 1] = CellType.BOXR;
						break;
					case "@":
						warehouse.robot = { x: 2 * x, y: y };
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

	warehouse.moveRobotBatch(robotMoves);
	console.log(warehouse.toString());

	const gpsSum = warehouse.gpsSum();
	console.log("GPS Sum", gpsSum);
}

// warehouseBot("input_testLarge");
// warehouseBot("input_testWide");
warehouseBot("input");
