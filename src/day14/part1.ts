// This first part seems quite ok, lots of things done before.
// Just positions, velocities, and a modulo to wrap the robots inside the room.

// If this continues the trend of previous days, part 2's gonna ask to compute a
// billion steps.
// I try not to think about that for now and do the naive approach first,
// though I'm wondering if
// (mod every step) == (mod final result) ?
// In which case we could do (position * velocity * time) % worldSize

// Anyway, first, copy some code from earlier days for a world class and some
// vector functions

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
		return Vec2.add(this.position, Vec2.scale(this.velocity, time));
	}

	move(time: number = 1) {
		this.position = this.nextPos(time);
	}
}

class BathroomMap {
	robots: Robot[] = [];

	constructor(public width: number, public height: number) {}

	moveRobots(time: number = 1) {
		for (const robot of this.robots) {
			robot.move(time);
			robot.position = { x: mod(robot.position.x, this.width), y: mod(robot.position.y, this.height) };
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
		let mapStr: string[][] = [...Array(this.height)].map((_) => Array(this.width).fill("."));

		for (const robot of this.robots) {
			if (mapStr[robot.position.y][robot.position.x] == ".") {
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

function moveTest() {
	const bathroom = BathroomMap.fromString(11, 7, "p=2,4 v=2,-3");

	bathroom.moveRobots(5);

	const expectPosition = { x: 1, y: 3 };
	const success = Vec2.equals(bathroom.robots[0].position, expectPosition);

	if (success) {
		console.log("Move test OK");
	} else {
		console.error("MOVE TEST ERROR");
		console.log("Expected", Vec2.toString(expectPosition), "- Got", bathroom.robots[0].position);
	}
}

function bathroomBotsStr(input: string, width = 101, height = 103) {
	const bathroom = BathroomMap.fromString(width, height, input);

	bathroom.moveRobots(100);

	console.log("Result");
	console.log(bathroom.toString());

	const quadrantCounts = bathroom.countQuadrants();
	console.log("Quadrants", quadrantCounts);

	const quadrantsTotal = quadrantCounts.NW * quadrantCounts.NE * quadrantCounts.SW * quadrantCounts.SE;
	console.log("Safety Factor", quadrantsTotal);
}

function bathroomBots(inputFile: string, width = 101, height = 103) {
	const input = readFileSync(`src/day14/${inputFile}`).toString().trim();
	return bathroomBotsStr(input, width, height);
}

moveTest();
bathroomBots("input_test", 11, 7);
bathroomBots("input", 101, 103);
