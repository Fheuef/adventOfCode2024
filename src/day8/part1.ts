// On the first read it sounds like utter bullshit, until you realize there's a
// super simple way to find antinodes :
// Pick an antenna A, find another antenna B of the same frequency
// Take the vector A->B, add it on B, and there's your antinode !

// Note: Don't worry about the second antinode, it will be found later when
// picking B and doing B->A

// Since antennas and antinodes can be in the same spot, I'm definitely gonna
// keep my habit of extracting in input into logic objects, and work with
// sparse object positions (not a cell matrix)

// Ended up struggling with how to keep antinodes unique since you can't use
// objects in a JS set, which fucking sucks (and I didn't want to much to an
// O(n²) check or during the search), but other than that no issues
// with the logic, so that's cool

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

	antennasAntinodes(antA: Antenna, antB: Antenna) {
		const diff = subVec2(antB.position, antA.position);
		return addVec2(antB.position, diff);
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

				const newAntinode = this.antennasAntinodes(antA, antB);
				if (this.isWithinMap(newAntinode)) antinodes.add(vec2ToShortString(newAntinode));
			}
		}

		return [...antinodes].map(vec2FromShortString);
	}

	toString(antinodes?: Vec2[]): string {
		let mapStr: string[][] = Array(this.height)
			.fill(0)
			.map((c) => Array(this.width).fill("."));

		for (const ant of this.antennas) {
			mapStr[ant.position.y][ant.position.x] = ant.frequency;
		}

		if (antinodes) {
			for (const antinode of antinodes) {
				mapStr[antinode.y][antinode.x] = "#";
			}
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
