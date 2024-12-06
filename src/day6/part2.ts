// To find a potential loop, run the guard simulation with an added obstacle at each step.
// Abort a possibility as soon as the guard exits or a loop is detected

// To avoid complete brute force on every position, run the guard once and then add obstacles on each visited step.

// Loop detection : keep track of which cells you've visited and which specific direction was visited.

// Ended up copying the functions of the first part into a class, to make it easier to clone and instantiate simulations.

// First approach was kinda recursive, it used a "main" guard simulation that started a secondary sim with an obstacle added on each step.
// It worked well on the example, and then had to handle duplicate obstacle positions using a Set.
// In the end, I still don't know why it gave 100+ new obstacles...

import { readFileSync } from "fs";

const animateDelay = 0;
const logFoundLoops = false;

enum CellType {
	EMPTY,
	OBSTACLE,
}

interface Cell {
	type: CellType;
	visits: Direction[];
	isNewObstacle?: boolean;
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
	map: Cell[][];
	guard: Guard = { position: { x: 0, y: 0 }, direction: "^" };
	looped = false;

	constructor(width?: number, height?: number) {
		if (width) {
			if (!height) height = width;

			this.map = Array(height);
			for (let i = 0; i < height; i++) {
				this.map[i] = [];
				for (let j = 0; j < width; j++) {
					this.map[i].push({ type: CellType.EMPTY, visits: [] });
				}
			}
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
		return this.map[y][x].type;
	}

	setCell(x: number, y: number, type: CellType) {
		if (!this.isValid({ x, y })) return;
		this.map[y][x].type = type;
	}

	getVisits(x: number, y: number): Direction[] | undefined {
		if (!this.isValid({ x, y })) return;
		return this.map[y][x].visits;
	}

	setVisited(x: number, y: number, direction: Direction) {
		if (!this.isValid({ x, y })) return;

		if (!this.map[y][x].visits.includes(direction)) {
			this.map[y][x].visits.push(direction);
		}
	}

	isGuardInLab() {
		return this.isValid(this.guard.position);
	}

	async stepGuard() {
		const nextPos = nextPosInDirection(this.guard.position, this.guard.direction);

		if (this.getCell(nextPos.x, nextPos.y) == CellType.OBSTACLE) {
			// Rotate guard if obstacle in front
			this.guard.direction = rotateDirection(this.guard.direction);
		} else {
			// End if guard is in a loop
			if (this.getVisits(nextPos.x, nextPos.y)?.includes(this.guard.direction)) {
				this.looped = true;
				return;
			}

			// Move guard
			this.setVisited(this.guard.position.x, this.guard.position.y, this.guard.direction);
			this.guard.position = nextPos;
			this.setVisited(this.guard.position.x, this.guard.position.y, this.guard.direction);
		}
	}

	async stepGuardUntilEnd(): Promise<"exit" | "loop"> {
		while (this.isGuardInLab() && !this.looped) {
			await this.stepGuard();

			if (animateDelay > 0) {
				console.log(this.toString());
				console.log("_________________________________");

				await new Promise((res) => setTimeout(res, animateDelay));
			}
		}

		if (this.looped) {
			if (logFoundLoops) {
				console.log(this.toString());
				console.log("LOOP HELL YEAH");
			}

			return "loop";
		}

		return "exit";
	}

	toString() {
		const mapStrLines: string[] = this.map.map((cellLine) =>
			cellLine
				.map((cell) => {
					if (cell.isNewObstacle) return "O";
					if (cell.type == CellType.OBSTACLE) return "#";

					const visitedHorizontal = cell.visits.includes(">") || cell.visits.includes("<");
					const visitedVertical = cell.visits.includes("^") || cell.visits.includes("V");

					if (visitedHorizontal && visitedVertical) return "+";
					if (visitedHorizontal) return "-";
					if (visitedVertical) return "|";

					return " ";
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

	clone(): LabMap {
		const cloneMap = new LabMap();
		cloneMap.map = this.map.map((line) => line.map((c) => ({ type: c.type, visits: [...c.visits] })));
		cloneMap.guard = { ...this.guard };

		return cloneMap;
	}

	static fromString(guardInput: string): LabMap {
		const inputLines = guardInput.split(/[\r]*[\n]/).filter((l) => l.length > 0);

		const height = inputLines.length;
		const width = inputLines[0].length;

		const labMap = new LabMap(width, height);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const cell = inputLines[y][x];
				if (cell == ".") continue;

				if (cell == "#") {
					labMap.setCell(x, y, CellType.OBSTACLE);
				} else if (directionsList.includes(cell as Direction)) {
					labMap.guard.position = { x, y };
				}
			}
		}

		return labMap;
	}
}

async function checkLoopWithObstacle(lab: LabMap, obstacle: Point): Promise<boolean> {
	if (!lab.isValid(obstacle)) return false;

	lab.setCell(obstacle.x, obstacle.y, CellType.OBSTACLE);
	lab.map[obstacle.y][obstacle.x].isNewObstacle = true;

	const exitReason = await lab.stepGuardUntilEnd();

	return exitReason == "loop";
}

async function loopsBruteForce(inputLab: string) {
	const labMap = LabMap.fromString(inputLab);
	const guardStart = { ...labMap.guard.position };

	let loopCounter = 0;
	for (let y = 0; y < labMap.height; y++) {
		for (let x = 0; x < labMap.width; x++) {
			if (x == guardStart.x && y == guardStart.y) continue;

			const newLab = labMap.clone();

			if (await checkLoopWithObstacle(newLab, { x, y })) {
				loopCounter++;
			}
		}
	}

	return loopCounter;
}

async function loopsUsingVisitedPos(inputLab: string) {
	const labMap = LabMap.fromString(inputLab);
	const guardStart = { ...labMap.guard.position };

	const firstVisitLab = labMap.clone();
	await firstVisitLab.stepGuardUntilEnd();

	const visitedCells: Point[] = [];
	for (let y = 0; y < firstVisitLab.height; y++) {
		for (let x = 0; x < firstVisitLab.width; x++) {
			if (firstVisitLab.getVisits(x, y)?.length) {
				visitedCells.push({ x, y });
			}
		}
	}

	// Try with obstacle on each visited cell (except starting pos)
	let loopsCount = 0;
	for (const pos of visitedCells) {
		if (pos.x == guardStart.x && pos.y == guardStart.y) continue;

		const tryLab = labMap.clone();
		if (await checkLoopWithObstacle(tryLab, pos)) {
			loopsCount++;
		}
	}

	return loopsCount;
}

async function guardPatrol(inputFile: string) {
	const input = readFileSync(`src/day6/${inputFile}`).toString();

	// const loops = loopsBruteForce(input);
	const loops = await loopsUsingVisitedPos(input);

	console.log("Loops", loops);
}

// guardPatrol("input_test");
guardPatrol("input");
