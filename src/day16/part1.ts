// Yaay 2D sim time again
// I think I'll start with a recursive search though the maze and see how it goes

// First solution was dogshit on the actual input

// Figured I really needed to find the path of lowest cost first, not a list
// I think I ended up making an A* algo, keeping a list of nodes to explore next,
// exploring first the lowest cost that is also closest to the end

// Code is a bit confused since I wasn't planning for this at first, but it works

import { readFileSync } from "fs";

enum MazeCell {
	EMPTY,
	WALL,
}

const directionsList = ["^", ">", "<", "v"] as const;

type Direction = (typeof directionsList)[number];

interface Vec2Like {
	x: number;
	y: number;
}

interface ExploreNode {
	score: number;
	position: Vec2Like;
	direction: Direction;
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

	static toString(v: Vec2Like, short = false) {
		if (short) {
			return `${v.x},${v.y}`;
		}

		return `(${v.x}, ${v.y})`;
	}

	static fromShortString(vecStr: string): Vec2Like {
		const values = vecStr.split(",");
		return { x: parseInt(values[0]), y: parseInt(values[1]) };
	}

	static equals(a: Vec2Like, b: Vec2Like): boolean {
		return a.x == b.x && a.y == b.y;
	}
}

function rotateDirection(direction: Direction, clockWise = true): Direction {
	if (clockWise) {
		switch (direction) {
			case "^":
				return ">";
			case ">":
				return "v";
			case "<":
				return "^";
			case "v":
				return "<";
		}
	} else {
		switch (direction) {
			case "^":
				return "<";
			case ">":
				return "^";
			case "<":
				return "v";
			case "v":
				return ">";
		}
	}
}

class MazeMap {
	maze: MazeCell[][];
	startState: { position: Vec2Like; direction: Direction };
	end: Vec2Like;

	constructor(width: number, height: number) {
		this.maze = [...Array(height)].map((_) => Array(width).fill(MazeCell.EMPTY));
	}

	get height(): number {
		return this.maze.length;
	}

	get width(): number {
		return this.maze[0]?.length || 0;
	}

	getCell({ x, y }: Vec2Like): MazeCell {
		return this.maze[y][x];
	}

	setCell({ x, y }: Vec2Like, mazeCell: MazeCell) {
		this.maze[y][x] = mazeCell;
	}

	nextPosInDir(pos: Vec2Like, dir: Direction): Vec2Like {
		const dirVec = Vec2.fromDirection(dir);
		return Vec2.add(pos, dirVec);
	}

	findCheapestSolution(): number {
		const exploreScore: number[][] = [...Array(this.height)].map((_) =>
			Array(this.width).fill(Number.POSITIVE_INFINITY)
		);
		const toExploreNext: ExploreNode[] = [];

		const addPosToExplore = (newNode: ExploreNode) => {
			const diffToEnd = Vec2.sub(this.end, newNode.position);
			const distToEnd = Math.abs(diffToEnd.x) + Math.abs(diffToEnd.y);
			const nodeExploreScore = newNode.score + distToEnd;

			if (nodeExploreScore > exploreScore[newNode.position.y][newNode.position.x]) return;

			exploreScore[newNode.position.y][newNode.position.x] = nodeExploreScore;

			toExploreNext.push(newNode);
			toExploreNext.sort(
				(a, b) => exploreScore[a.position.y][a.position.x] - exploreScore[b.position.y][b.position.x]
			);
		};

		let foundExitWithScore: number | undefined;

		addPosToExplore({ position: this.startState.position, direction: this.startState.direction, score: 0 });

		let step = 0;
		let printStep = 0;
		const printInterval = 2000;
		while (
			toExploreNext.length > 0 &&
			(foundExitWithScore == undefined || toExploreNext[0].score <= foundExitWithScore)
		) {
			const exploreNode = toExploreNext[0];
			toExploreNext.splice(0, 1);

			const newNodes = this.exploreMaze(exploreNode);

			for (const node of newNodes) {
				if (Vec2.equals(node.position, this.end)) {
					if (foundExitWithScore == undefined || node.score < foundExitWithScore)
						foundExitWithScore = node.score;
					continue;
				}

				addPosToExplore(node);
			}

			// Debug
			// if (printStep + printInterval <= step) {
			// 	printStep = step;
			// 	console.log("Step", step);
			// 	console.log("Explore next", toExploreNext.length);
			// 	console.log("Lowest score", exploreNode);
			// 	console.log("Found exit", foundExitWithScore);
			// }
			// step++;
		}

		return foundExitWithScore!;
	}

	exploreMaze({ score, position, direction }: ExploreNode): ExploreNode[] {
		if (this.getCell(position) == MazeCell.WALL) return [];

		const newNodes: ExploreNode[] = [];

		// Forward
		const forwardPos = this.nextPosInDir(position, direction);
		if (this.getCell(forwardPos) == MazeCell.EMPTY)
			newNodes.push({ position: forwardPos, direction: direction, score: score + 1 });

		// Rotate 90deg clockwise
		const rightDir = rotateDirection(direction, true);
		const rightPos = this.nextPosInDir(position, rightDir);
		if (this.getCell(rightPos) == MazeCell.EMPTY)
			newNodes.push({ position: rightPos, direction: rightDir, score: score + 1000 + 1 });

		// Rotate 90deg anti-clockwise
		const leftDir = rotateDirection(direction, false);
		const leftPos = this.nextPosInDir(position, leftDir);
		if (this.getCell(leftPos) == MazeCell.EMPTY)
			newNodes.push({ position: leftPos, direction: leftDir, score: score + 1000 + 1 });

		return newNodes;
	}

	toString() {
		const mapStrLines: string[][] = this.maze.map((cellLine) =>
			cellLine.map((cell) => {
				switch (cell) {
					case MazeCell.WALL:
						return "#";

					default:
						return ".";
				}
			})
		);

		mapStrLines[this.startState.position.y][this.startState.position.x] = "S";
		mapStrLines[this.end.y][this.end.x] = "E";

		return mapStrLines.map((line) => line.join("")).join("\n");
	}

	static fromString(warehouseStr: string): MazeMap {
		const inputLines = warehouseStr.trim().split(/\r?\n/);

		const height = inputLines.length;
		const width = inputLines[0].length;

		const warehouse = new MazeMap(width, height);

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const char = inputLines[y][x];

				switch (char) {
					case "#":
						warehouse.setCell({ x, y }, MazeCell.WALL);
						break;
					case "S":
						warehouse.startState = { position: { x, y }, direction: ">" };
						break;
					case "E":
						warehouse.end = { x, y };
						break;
				}
			}
		}

		return warehouse;
	}
}

async function reindeerMaze(inputFile: string) {
	const input = readFileSync(`src/day16/${inputFile}`).toString();

	const maze = MazeMap.fromString(input);
	const solution = maze.findCheapestSolution();

	console.log("Shortest solution", solution);
}

// reindeerMaze("input_test"); // 7036
// reindeerMaze("input_test2"); // 11048
reindeerMaze("input"); // 102460
