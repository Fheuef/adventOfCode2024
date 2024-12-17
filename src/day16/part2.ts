// Hm.
// Maybe I can keep searching while cells to explore have a score <= bestScore ?
// Also need to get the path (not just the score)

// Started doing Dijkstra and saving paths of equal score
// Problem with forks

// >>>^>>>>>
//    ^
//    ^

// The 2 paths coming onto the fork are not considered equivalent, even tho
// they will be (after the bottom one has turned)
// Solution : graph should add a node for rotation (right now the score is tied
// to a position only, no matter where you come from)
// Other solution : update cost backwards before a turn ??

// I kept trying things but it seems like I only made it worse.
// I don't even know what works and what doesn't in the mess below.
// Tried rewriting using using node objects, from what I understand if the graph
// was built correctly and accounted for the turns in the cost I could just run
// Dijkstra in it, but I can't figure out a way to solve the fork problem
// (And I've gone crazy trying to save equal paths while not deleting valid previous nodes)

// (Also I wonder why my first DFS using an exact score didn't work)

// I've wasted way too much time on this and I'm going in circle, that's where I give up for now.

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
	rotation?: boolean;
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

	findCheapestSolution(): { node: ExploreNode; prevNodes: Map<Direction, Vec2Like>[][] } {
		const exploreScore: Record<Direction, number>[][] = [...Array(this.height)].map((_) =>
			[...Array(this.width)].map((_) => ({
				"^": Number.POSITIVE_INFINITY,
				">": Number.POSITIVE_INFINITY,
				v: Number.POSITIVE_INFINITY,
				"<": Number.POSITIVE_INFINITY,
			}))
		);

		const explored: Record<Direction, boolean>[][] = [...Array(this.height)].map((_) =>
			[...Array(this.width)].map((_) => ({
				"^": false,
				">": false,
				v: false,
				"<": false,
			}))
		);

		const prevNodes: Map<Direction, Vec2Like>[][] = [...Array(this.height)].map((_) =>
			[...Array(this.width)].map((_) => new Map())
		);

		let foundExitWithScore: ExploreNode | undefined;

		const exploreQueue: ExploreNode[] = [
			{ position: this.startState.position, direction: this.startState.direction, score: 0 },
		];

		exploreScore[this.startState.position.y][this.startState.position.x][this.startState.direction] = 0;

		let step = 0;
		let printStep = 0;
		const printInterval = 2000;
		while (exploreQueue.length > 0) {
			exploreQueue.sort(
				(a, b) =>
					exploreScore[a.position.y][a.position.x][a.direction] -
					exploreScore[b.position.y][b.position.x][b.direction]
			);

			const exploreNode = exploreQueue[0];
			exploreQueue.splice(0, 1);

			const newNodes = this.neighborNodes(exploreNode);

			for (const newNode of newNodes) {
				if (explored[newNode.position.y][newNode.position.x][newNode.direction]) {
					continue;
				}
				explored[newNode.position.y][newNode.position.x][newNode.direction] = true;

				const fromPos = exploreNode.position;

				if (Vec2.equals(newNode.position, { x: 13, y: 13 })) {
					console.log("test");
				}

				const isEnd = Vec2.equals(newNode.position, this.end);

				const isRotationNode = newNode.rotation ?? false;

				// if (!isRotationNode && explored[exploreNode.position.y][exploreNode.position.x]) continue;

				// const newNodeScore = exploreNode.score + (isRotationNode ? 1000 : 1);
				const newNodeScore = newNode.score;
				const savedScore = isEnd
					? foundExitWithScore?.score ?? Number.POSITIVE_INFINITY
					: exploreScore[newNode.position.y][newNode.position.x][newNode.direction];

				if (newNodeScore > savedScore) continue;

				if (newNodeScore == savedScore) {
					// add fromPos to list of prev nodes for this node
					// prevNodes[newNode.position.y][newNode.position.x].set(newNode.direction, fromPos);
				} else {
					// Better score: new prev nodes
					exploreScore[newNode.position.y][newNode.position.x][newNode.direction] = newNodeScore;

					let prevPos = fromPos;

					// if (Vec2.equals(prevPos, newNode.position)) {
					// 	// let i = 0;
					// 	for (const possiblePrev of prevNodes[fromPos.y][fromPos.x].values()) {
					// 		prevPos = possiblePrev;
					// 		if (!Vec2.equals(prevPos, newNode.position)) {
					// 			break;
					// 		}
					// 	}
					// }

					if (!Vec2.equals(prevPos, newNode.position))
						prevNodes[newNode.position.y][newNode.position.x].clear();

					prevNodes[newNode.position.y][newNode.position.x].set(newNode.direction, prevPos);

					// prevNodes[newNode.position.y][newNode.position.x].push(fromPos);
				}

				if (isEnd) {
					if (!foundExitWithScore || newNodeScore < foundExitWithScore.score) {
						foundExitWithScore = { ...newNode, score: newNodeScore };
						console.log("Found exit with score", foundExitWithScore);
					}
				} else {
					exploreQueue.push({ ...newNode, score: newNodeScore });
				}
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

		return { node: foundExitWithScore!, prevNodes };
	}

	neighborNodes({ score, position, direction, rotation }: ExploreNode): ExploreNode[] {
		if (this.getCell(position) == MazeCell.WALL) return [];

		const newNodes: ExploreNode[] = [];

		// Move forward
		const forwardPos = this.nextPosInDir(position, direction);
		if (this.getCell(forwardPos) == MazeCell.EMPTY)
			newNodes.push({ position: forwardPos, direction: direction, score: score + 1 });

		// Don't rotate twice without moving
		if (rotation) return newNodes;

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

		const explored: Record<Direction, boolean>[][] = [...Array(this.height)].map((_) =>
			[...Array(this.width)].map((_) => ({
				"^": false,
				">": false,
				v: false,
				"<": false,
			}))
		);

		const buildPos = (position: Vec2Like) => {
			for (const [dir, prev] of prevNodes[position.y][position.x].entries()) {
				if (explored[prev.y][prev.x][dir]) continue;

				explored[prev.y][prev.x][dir] = true;

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
