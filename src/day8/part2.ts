// This seems too easy, I guess when creating antinodes produced by antenna
// I just have to keep going all the way until the map border ?

// hell yea first try

import { readFileSync } from "fs";

interface Vec2 {
	x: number;
	y: number;
}

/**
 * a + b
 */
function addVec2(a: Vec2, b: Vec2): Vec2 {
	return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * a - b
 */
function subVec2(a: Vec2, b: Vec2): Vec2 {
	return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * a * n
 */
function scaleVec2(a: Vec2, n: number): Vec2 {
	return { x: a.x * n, y: a.y * n };
}

/**
 * f(a)
 */
function applyVec2(vec: Vec2, f: (n: number) => number) {
	return { x: f(vec.x), y: f(vec.y) };
}

function vec2ToShortString(v: Vec2) {
	return `${v.x},${v.y}`;
}

function vec2FromShortString(vecStr: string) {
	const values = vecStr.split(",");
	return { x: parseInt(values[0]), y: parseInt(values[1]) };
}

interface Antenna {
	position: Vec2;
	frequency: string;
}

class AntennaMap {
	antennas: Antenna[] = [];

	constructor(public width: number, public height: number) {}

	isWithinMap(position: Vec2): boolean {
		return position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.height;
	}

	antennasAntinodes(antA: Antenna, antB: Antenna): Vec2[] {
		const antinodes: Vec2[] = [];

		// Add (B-A) * n to A until outside the map
		// n starts at 1, even tho A + (B-A)*1 = B, and this is actually what we want

		const stepVec = subVec2(antB.position, antA.position);
		let step = 1;
		let inMap = true;
		while (inMap) {
			const newAntinode = addVec2(antA.position, scaleVec2(stepVec, step));
			if (this.isWithinMap(newAntinode)) {
				antinodes.push(newAntinode);
				step++;
			} else {
				inMap = false;
			}
		}

		return antinodes;
	}

	findAllAntinodes(): Vec2[] {
		// We want antinodes to be unique
		// Gotta store antinodes as strings first to use them in a Set...
		// This is stupid
		const antinodes = new Set<string>();

		for (const antA of this.antennas) {
			for (const antB of this.antennas) {
				if (antA == antB) continue;
				if (antA.frequency != antB.frequency) continue;

				const newAntinodes = this.antennasAntinodes(antA, antB);
				for (const newAnt of newAntinodes) {
					antinodes.add(vec2ToShortString(newAnt));
				}
			}
		}

		return [...antinodes].map(vec2FromShortString);
	}

	toString(antinodes?: Vec2[]): string {
		let mapStr: string[][] = Array(this.height)
			.fill(0)
			.map((c) => Array(this.width).fill("."));

		if (antinodes) {
			for (const antinode of antinodes) {
				mapStr[antinode.y][antinode.x] = "#";
			}
		}

		for (const ant of this.antennas) {
			mapStr[ant.position.y][ant.position.x] = ant.frequency;
		}

		return mapStr.map((line) => line.join("")).join("\n");
	}

	static fromString(antennasStr: string): AntennaMap {
		const inputLines = antennasStr.split(/[\r]*[\n]/).filter((l) => l.length > 0);

		const height = inputLines.length;
		const width = inputLines[0].length;

		const antMap = new AntennaMap(width, height);

		const antennaRegex = /^[a-z0-9]$/i;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const char = inputLines[y][x];

				if (!char.match(antennaRegex)) continue;

				antMap.antennas.push({ position: { x, y }, frequency: char });
			}
		}

		return antMap;
	}
}

async function bunnyAntennas(inputFile: string) {
	const input = readFileSync(`src/day8/${inputFile}`).toString();

	const antennaMap = AntennaMap.fromString(input);

	const antinodes = antennaMap.findAllAntinodes();
	console.log(antennaMap.toString(antinodes));

	console.log("Antinodes", antinodes.length);
}

// bunnyAntennas("input_test");
bunnyAntennas("input");
