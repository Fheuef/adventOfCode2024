// Just an attempt at rewriting part 2 with "proper" nodes or something, gave up halfway through

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

interface MazeNode {
	position: Vec2Like;
	direction: Direction;
	score: number;
	neighbors: MazeNode[];
	prev?: MazeNode[];
	// rotation?: boolean;
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

	findCheapestSolution(): { node: MazeNode; prevNodes: Map<Direction, Vec2Like>[][] } {
		// const explored: Map<Direction, boolean>[][] = [...Array(this.height)].map((_) => Array(this.width).fill(false));

		// const mazeNodes: MazeNode[][] = [];

		for (let y = 0; y < this.height; y++) {
			mazeNodes.push([]);
			for (let x = 0; x < this.width; x++) {
				if (this.getCell({ x, y }) == MazeCell.WALL) continue;

				const cellNode = {
					position: { x, y },
					score: Number.POSITIVE_INFINITY,
				};

				mazeNodes[y].push(cellNode);
			}
		}

		// const prevNodes: Map<Direction, Vec2Like>[][] = [...Array(this.height)].map((_) =>
		// 	[...Array(this.width)].map((_) => new Map())
		// );

		// let foundExitWithScore: ExploreNode | undefined;

		const startNode = mazeNodes[this.startState.position.y][this.startState.position.x];
		startNode.direction = ">";

		const exploreQueue: MazeNode[] = [startNode];

		while (exploreQueue.length > 0) {
			exploreQueue.sort((a, b) => a.score - b.score);

			const exploreNode = exploreQueue[0];
			exploreQueue.splice(0, 1);

			const neighbors = this.neighborNodes(mazeNodes, exploreNode.position);

			for (const neighbor of neighbors) {
			}
		}

		return { node: foundExitWithScore!, prevNodes };
	}

	neighborNodes(nodes: MazeNode[][], node: MazeNode): MazeNode[] {
		if (this.getCell(node.position) != MazeCell.EMPTY) return [];

		const newNodes: MazeNode[] = [];

		// Move forward
		const forwardPos = this.nextPosInDir(node.position, node.direction);
		if (this.getCell(forwardPos) == MazeCell.EMPTY)
			newNodes.push({ position: forwardPos, direction: direction, score: score + 1 });

		// Don't rotate twice without moving
		if (node.rotation) return newNodes;

		// Rotate 90deg clockwise
		const rightDir = rotateDirection(direction, true);
		const rightPos = this.nextPosInDir(position, rightDir);
		if (this.getCell(rightPos) == MazeCell.EMPTY)
			newNodes.push({ position: position, direction: rightDir, score: score + 1000, rotation: true });

		// Rotate 90deg anti-clockwise
		const leftDir = rotateDirection(direction, false);
		const leftPos = this.nextPosInDir(position, leftDir);
		if (this.getCell(leftPos) == MazeCell.EMPTY)
			newNodes.push({ position: position, direction: leftDir, score: score + 1000, rotation: true });

		return newNodes;
	}

	buildPaths(endPosition: Vec2Like, prevNodes: Map<Direction, Vec2Like>[][]) {
		const paths: Vec2Like[] = [endPosition];

		const explored: boolean[][] = [...Array(this.height)].map((_) => Array(this.width).fill(false));

		const buildPos = (position: Vec2Like) => {
			for (const prev of prevNodes[position.y][position.x].values()) {
				if (explored[prev.y][prev.x]) continue;

				explored[prev.y][prev.x] = true;

				paths.push(prev);
				buildPos(prev);
			}
		};

		buildPos(endPosition);

		return paths;
	}

	toString(withPaths: Vec2Like[] = []) {
		const mapStrLines: string[][] = this.maze.map((cellLine) =>
			cellLine.map((cell) => {
				switch (cell) {
					case MazeCell.WALL:
						// return "#";
						return "#";

					default:
						return " ";
				}
			})
		);

		mapStrLines[this.startState.position.y][this.startState.position.x] = "S";
		mapStrLines[this.end.y][this.end.x] = "E";

		for (const pos of withPaths) {
			mapStrLines[pos.y][pos.x] = "O";
		}

		return mapStrLines.map((line) => line.join("")).join("\n");
	}

	static countPathCells(warehouseStr: string): number {
		return [...warehouseStr.matchAll(/O/g)].length;
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
	console.log(maze.toString());

	const solution = maze.findCheapestSolution();

	console.log("Shortest solution", solution.node.score);

	const paths = maze.buildPaths(solution.node.position, solution.prevNodes);
	console.log(paths);

	const mazePathsStr = maze.toString(paths);
	console.log(mazePathsStr);

	console.log(paths.length);

	console.log("Path cells", MazeMap.countPathCells(mazePathsStr));
}

reindeerMaze("input_test"); // 7036 - Path 45
// reindeerMaze("input_test2"); // 11048 - Path 64
// reindeerMaze("input"); // 102460
