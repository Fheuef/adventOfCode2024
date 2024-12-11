// Sounds pretty straightforward, just gonna make a lil class for the line of stones.
// The one weird thing is the splitting rule, tho it seems easy-ish to do by first
// converting the number to a string

import { readFileSync } from "fs";

class StonesLine {
	constructor(public stones: number[] = []) {}

	blink(times: number = 1) {
		let newStones: StonesLine = this;

		for (let i = 0; i < times; i++) {
			newStones = newStones.blinkOnce();
			// console.log(newStones.toString());
		}

		return newStones;
	}

	blinkOnce(): StonesLine {
		const newStones: number[] = [];

		for (const stone of this.stones) {
			// Rule 1
			if (stone == 0) {
				newStones.push(1);

				continue;
			}

			// Rule 2
			const stoneStr = "" + stone;
			if (stoneStr.length % 2 == 0) {
				newStones.push(parseInt(stoneStr.substring(0, stoneStr.length / 2)));
				newStones.push(parseInt(stoneStr.substring(stoneStr.length / 2)));

				continue;
			}

			// Rule 3
			newStones.push(stone * 2024);
		}

		return new StonesLine(newStones);
	}

	toString() {
		return this.stones.join(" ");
	}

	static fromString(stoneLineStr: string): StonesLine {
		return new StonesLine(stoneLineStr.split(" ").map((n) => parseInt(n)));
	}
}

function plutoPebbles(inputFile: string, numberOfBlinks = 25) {
	const input = readFileSync(`src/day11/${inputFile}`).toString().trim();

	let stones = StonesLine.fromString(input);
	stones = stones.blink(numberOfBlinks);
	console.log(`Number of stones after ${numberOfBlinks} blinks`, stones.stones.length);
}

// plutoPebbles("input_test", 6);
// plutoPebbles("input_test", 25);

plutoPebbles("input", 25);
