// Well, the number of stones grows quite quickly.
// After trying to use part 1 with 75 steps, it got real slow and crashed saying
// "something something invalid size"

// Not sure how to go about it tbh. After about 30 blinks, there are over 30M
// stones in the array.
// Maybe there is a way to find patterns, and instead of computing them entirely
// just know how many stones they will produce ?

// I think I can cache the stone count that a number produces after n blinks
// Map<{stoneNumber, blinks}, numberOfStones>
// A lot of stones will split into 0 and 1, there is lots of duplication in the computations

// I am a fucking idiot
// For like an hour I was going crazy cause there was 0 hits into the cache
// I had written `map[key] = value` instead of `map.set(key, value)`
// Why did the compiler let me do that, fuckn hell

// Anyway, it works !!
// The basic algorithm was completely stuck at step 33, and this version
// takes less than a second to do all 75 steps !

import { readFileSync } from "fs";

class StonesLine {
	constructor(public stones: number[] = []) {}

	blink(times: number = 1) {
		let count = 0;
		for (const stone of this.stones) {
			count += StonesLine.stonesAfterBlinks(stone, times);
		}

		return count;
	}

	static stonesMap: Map<string, number> = new Map();

	static cacheStats = { hits: 0, writes: 0 };

	static stonesAfterBlinks(stoneValue: number, blinks: number): number {
		if (blinks < 1) return 1;

		const mapKey = "" + stoneValue + "," + blinks;

		const mapValue = this.stonesMap.get(mapKey);
		if (mapValue != undefined) {
			this.cacheStats.hits++;
			return mapValue;
		}

		this.cacheStats.writes++;

		let resultStones: number;

		if (blinks > 1) {
			if (stoneValue == 0) {
				resultStones = this.stonesAfterBlinks(1, blinks - 1);
			} else {
				const stoneValueStr = "" + stoneValue;
				if (stoneValueStr.length % 2 == 0) {
					const leftValue = parseInt(stoneValueStr.substring(0, stoneValueStr.length / 2));
					const rightValue = parseInt(stoneValueStr.substring(stoneValueStr.length / 2));

					resultStones =
						this.stonesAfterBlinks(leftValue, blinks - 1) + this.stonesAfterBlinks(rightValue, blinks - 1);
				} else {
					resultStones = this.stonesAfterBlinks(stoneValue * 2024, blinks - 1);
				}
			}
		} else {
			// Blink == 1

			const stoneValueStr = "" + stoneValue;
			if (stoneValueStr.length % 2 == 0) {
				resultStones = 2;
			} else {
				resultStones = 1;
			}
		}

		// The fact that this compiles, and even showed values in the debugger as
		// if everyting was fine, makes me want to commit war crimes
		//
		// this.stonesMap[mapKey] = resultStones;

		this.stonesMap.set(mapKey, resultStones);

		return resultStones;
	}

	static fromString(stoneLineStr: string): StonesLine {
		return new StonesLine(stoneLineStr.split(" ").map((n) => parseInt(n)));
	}
}

function blinkStones(stoneLineStr: string, numberOfBlinks: number) {
	const stones = StonesLine.fromString(stoneLineStr);
	const finalStoneNumber = stones.blink(numberOfBlinks);

	console.log("Cache stats", StonesLine.cacheStats);
	console.log(`Number of stones after ${numberOfBlinks} blinks`, finalStoneNumber);
}

function plutoPebbles(inputFile: string, numberOfBlinks = 25) {
	const input = readFileSync(`src/day11/${inputFile}`).toString().trim();

	blinkStones(input, numberOfBlinks);
}

// plutoPebbles("input_test", 6);
// plutoPebbles("input_test", 25);
// plutoPebbles("input_test", 75);

// plutoPebbles("input", 25);
plutoPebbles("input", 75);
