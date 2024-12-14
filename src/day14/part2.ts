// Shit that is even worse than what I expected
// What does it even mean ??
// "Most" of the robots ?? Really ???

// I don't expect that I'll see anything by running it and looking manually

// Maybe the quadrants counting thing can help ?
// In the shape of a tree, the two top qudrants should have a lot more robots than the
// bottom ones
// I'll try having a breakpoint and printing whenever that happens
// (Also changed toString to have clearer empty space)

// Pausing when bottom > top * 1.5
// Quite often, every <1000 seconds, there are a lot of robots an in area just under
// half height

// HELL YEA
// Found a very pretty christmas tree after 7569 steps
// It's smaller than I expected so it doesn't cover that much of the robots, but it
// happens in the bottom half of the screen so it got detected !

import { readFileSync } from "fs";

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

	static toString(v: Vec2Like) {
		return `(${v.x}, ${v.y})`;
	}

	static equals(a: Vec2Like, b: Vec2Like): boolean {
		return a.x == b.x && a.y == b.y;
	}
}

/**
 * True modulo
 * @returns a mod n
 */
function mod(a: number, n: number) {
	return ((a % n) + n) % n;
}

class Robot {
	constructor(public position: Vec2Like = { x: 0, y: 0 }, public velocity: Vec2Like = { x: 0, y: 0 }) {}

	nextPos(time: number = 1): Vec2Like {
		return Vec2.add(this.position, Vec2.scale(this.velocity, 1));
	}

	move(time: number = 1) {
		this.position = this.nextPos(time);
	}
}

class BathroomMap {
	robots: Robot[] = [];

	constructor(public width: number, public height: number) {}

	moveRobots(time: number = 1) {
		for (let i = 0; i < time; i++) {
			for (const robot of this.robots) {
				robot.move(1);
				robot.position = { x: mod(robot.position.x, this.width), y: mod(robot.position.y, this.height) };
			}

			const counts = this.countQuadrants();
			const topCount = counts.NW + counts.NE;
			const bottomCount = counts.SW + counts.SE;

			const threshold = 1.5;

			if (bottomCount > topCount * threshold) {
				console.log(this.toString());
				console.log(`${i + 1} seconds elapsed`);

				console.log(); // Breakpoint here
			}
		}
	}

	countQuadrants() {
		const midWidth = Math.floor(this.width / 2);
		const midHeight = Math.floor(this.height / 2);

		const count = {
			NW: 0,
			NE: 0,
			SE: 0,
			SW: 0,
		};

		for (const robot of this.robots) {
			if (robot.position.x < midWidth && robot.position.y < midHeight) {
				count.NW++;
			} else if (robot.position.x > midWidth && robot.position.y < midHeight) {
				count.NE++;
			} else if (robot.position.x < midWidth && robot.position.y > midHeight) {
				count.SW++;
			} else if (robot.position.x > midWidth && robot.position.y > midHeight) {
				count.SE++;
			}
		}

		return count;
	}

	toCharMap(): string[][] {
		const emptyChar = " ";
		let mapStr: string[][] = [...Array(this.height)].map((_) => Array(this.width).fill(emptyChar));

		for (const robot of this.robots) {
			if (mapStr[robot.position.y][robot.position.x] == emptyChar) {
				mapStr[robot.position.y][robot.position.x] = "1";
			} else {
				// to int -> +1 -> to string
				mapStr[robot.position.y][robot.position.x] = +mapStr[robot.position.y][robot.position.x] + 1 + "";
			}
		}

		return mapStr;
	}

	toString(): string {
		return this.toCharMap()
			.map((line) => line.join(""))
			.join("\n");
	}

	static fromString(width: number, height: number, robots: string): BathroomMap {
		const inputLines = robots.split(/\r?\n/);

		const bathroom = new BathroomMap(width, height);

		for (const line of inputLines) {
			const lineNumbers = line.match(/-?\d+/g);
			if (!lineNumbers || lineNumbers.length != 4) continue;

			bathroom.robots.push(
				new Robot(
					{ x: parseInt(lineNumbers[0]), y: parseInt(lineNumbers[1]) },
					{ x: parseInt(lineNumbers[2]), y: parseInt(lineNumbers[3]) }
				)
			);
		}

		return bathroom;
	}
}

function bathroomBotsStr(input: string, width = 101, height = 103) {
	const bathroom = BathroomMap.fromString(width, height, input);

	bathroom.moveRobots(7569);
}

function bathroomBots(inputFile: string, width = 101, height = 103) {
	const input = readFileSync(`src/day14/${inputFile}`).toString().trim();
	return bathroomBotsStr(input, width, height);
}

bathroomBots("input", 101, 103);
// Debug and add a breakpoint on line 109 to pause on probable christmas trees
