// Finally found a solution one month after my first try at this.

// My first ideas didn't really get anywhere, the initial code had been frankensteined
// into an almost-Dijkstra search that tried to build a graph as it was exploring the
// maze. It got really confusing and I'm pretty sure it ended up going in circles.
// The main issue that had me pulling my hair was basically forks:

// 2>>>^>>>>>
//     ^
//     ^
//     1
// (coming from the bottom first, left path would be equivalent after the fork, but is abandonned too early)

// ---

// The new working solution first builds a graph out of the empty maze positions. Each cell
// gets 4 nodes for each of the 4 possible directions on that cell.
// The 4 nodes are linked with edges of cost 1000. Then, it goes through each node, and
// links it to the one in front (same direction, if it's not a wall) with a cost of 1.

// Next, it's a straightforward Dijkstra search through this new graph.
// From here, getting ALL the best paths isn't too different, we just have to save a list of
// previous nodes on each node (instead of a single node), and then do a DFS from the
// end node when building the paths.

// ---

// This whole thing had been stirring in my mind most days for a month since I gave up on it.
// When I finally took the time to implement this, it worked on the first try, so that feels pretty fuckin good :D

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

class MazeNode {
	hash: string;
	edges: WeightedEdge<MazeNode>[] = [];

	cost: number = Number.POSITIVE_INFINITY;
	prev?: MazeNode[];

	constructor(readonly position: Vec2Like, readonly direction: Direction) {
		this.hash = MazeNode.makeHash(position, direction);
	}

	addNextNode(node: MazeNode, cost: number) {
		this.edges.push({ node: node, weight: cost });
	}

	static makeHash(position: Vec2Like, direction: Direction): string {
		return `${position.x},${position.y},${direction}`;
	}
}

interface WeightedEdge<T> {
	node: T;
	weight: number;
}

class Vec2 {
	/**
	 * a + b
	 */
	static add(a: Vec2Like, b: Vec2Like): Vec2Like {
		return { x: a.x + b.x, y: a.y + b.y };
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

	static equals(a: Vec2Like, b: Vec2Like): boolean {
		return a.x == b.x && a.y == b.y;
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

	buildNavGraph(): Map<string, MazeNode> {
		const graph = new Map<string, MazeNode>();

		// Create nodes
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				// Only empty positions
				if (this.maze[y][x] != MazeCell.EMPTY) continue;

				// Create 1 node for each direction
				const upNode = new MazeNode({ x, y }, "^");
				const rightNode = new MazeNode({ x, y }, ">");
				const downNode = new MazeNode({ x, y }, "v");
				const leftNode = new MazeNode({ x, y }, "<");

				// Rotation edges
				upNode.addNextNode(rightNode, 1000);
				upNode.addNextNode(leftNode, 1000);
				rightNode.addNextNode(upNode, 1000);
				rightNode.addNextNode(downNode, 1000);
				downNode.addNextNode(rightNode, 1000);
				downNode.addNextNode(leftNode, 1000);
				leftNode.addNextNode(downNode, 1000);
				leftNode.addNextNode(upNode, 1000);

				graph.set(upNode.hash, upNode);
				graph.set(rightNode.hash, rightNode);
				graph.set(downNode.hash, downNode);
				graph.set(leftNode.hash, leftNode);
			}
		}

		// Movement edges between positions
		for (const [index, node] of graph) {
			const forwardPos = Vec2.add(node.position, Vec2.fromDirection(node.direction));
			const forwardNode = graph.get(MazeNode.makeHash(forwardPos, node.direction));

			if (!forwardNode) continue;

			node.addNextNode(forwardNode, 1);
		}

		return graph;
	}

	/**
	 * Runs the Dijkstra algorithm on the given graph. Modifies the graph by setting
	 * cost values and previous nodes for the shortest paths from the maze's start
	 * position to the exit.
	 */
	dijkstra(graph: Map<string, MazeNode>) {
		const exploreQueue: MazeNode[] = [...graph.values()];
		const explored = new Set<string>();

		const startNode = graph.get(MazeNode.makeHash(this.startState.position, this.startState.direction));
		if (!startNode) throw new Error("No start node");

		startNode.cost = 0;

		const popMinNode = () => {
			let minNodeIndex = 0;
			let minCost = exploreQueue[0].cost;

			for (let i = 0; i < exploreQueue.length; i++) {
				const n = exploreQueue[i];

				if (n.cost < minCost) {
					minCost = n.cost;
					minNodeIndex = i;
				}
			}

			const minNode = exploreQueue[minNodeIndex];
			exploreQueue.splice(minNodeIndex, 1);

			return minNode;
		};

		while (exploreQueue.length > 0) {
			// Get node with minimum cost from queue
			const exploreNode = popMinNode();

			explored.add(exploreNode.hash);

			// Reached exit
			if (Vec2.equals(exploreNode.position, this.end)) {
				graph.set("end", exploreNode);
				break;
			}

			for (const neighborEdge of exploreNode.edges) {
				// Unexplored neighbor
				if (explored.has(neighborEdge.node.hash)) continue;

				const newCost = exploreNode.cost + neighborEdge.weight;
				if (newCost < neighborEdge.node.cost) {
					neighborEdge.node.cost = newCost;
					neighborEdge.node.prev = [exploreNode];
				} else if (newCost == neighborEdge.node.cost) {
					const currentPrev = neighborEdge.node.prev ?? [];
					neighborEdge.node.prev = [...currentPrev, exploreNode];
				}
			}
		}
	}

	buildPath(graph: Map<string, MazeNode>) {
		const path: Vec2Like[] = [];
		const explored = new Set<string>();

		let endNode: MazeNode | undefined = graph.get("end");
		if (!endNode) return path;

		const startNode = graph.get(MazeNode.makeHash(this.startState.position, this.startState.direction));
		if (!endNode.prev && endNode != startNode) return path;

		const buildNode = (node: MazeNode | undefined) => {
			if (!node) return;

			explored.add(node.hash);

			path.push(node.position);

			if (node.prev) {
				for (const prevNode of node.prev) {
					if (!explored.has(prevNode.hash)) buildNode(prevNode);
				}
			}
		};

		buildNode(endNode);

		path.reverse();

		return path;
	}

	findBestPaths() {
		const graph = this.buildNavGraph();

		this.dijkstra(graph);
		const endNode = graph.get("end")!;

		const path = this.buildPath(graph);

		return { cost: endNode.cost, path: path };
	}

	toString(withPaths: Vec2Like[] = [], ansiColor = true) {
		const mapStrLines: string[][] = this.maze.map((cellLine) =>
			cellLine.map((cell) => {
				switch (cell) {
					case MazeCell.WALL:
						return "#";

					default:
						return " ";
				}
			})
		);

		mapStrLines[this.startState.position.y][this.startState.position.x] = "S";
		mapStrLines[this.end.y][this.end.x] = "E";

		let pathCellStr = "O";
		if (ansiColor) {
			pathCellStr = "\x1b[31m" + pathCellStr + "\x1b[0m";
		}

		for (const pos of withPaths) {
			mapStrLines[pos.y][pos.x] = pathCellStr;
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

	const solution = maze.findBestPaths();

	const mazePathsStr = maze.toString(solution.path);
	console.log(mazePathsStr);

	console.log("Shortest solution", solution.cost);
	console.log("Path cells", MazeMap.countPathCells(mazePathsStr));
}

// reindeerMaze("input_test"); // 7036 - Path 45
// reindeerMaze("input_test2"); // 11048 - Path 64
reindeerMaze("input"); // 102460 - Path 527
