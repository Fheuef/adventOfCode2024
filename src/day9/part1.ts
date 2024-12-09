// First thought after reading the whole thing : no indication given of
// what happens after 9 files, so I'm guessing the IDs keep increasing as
// normal, and you just can't represent it as string with 1 char per block anymore.
// Also means it cannot be done with a string directly and you actually need
// each file ID to be in an array I guess

// After writing some basic functions to read and write the diskmaps, I'm
// thinking of a loop with indices stepping from the start and the end
// of the map.
// If the first points to a free space and the second points
// to a file block, you swap the values and step both indices.
// (Logically if one of them is not valid you step it individually)

import { readFileSync } from "fs";

type DiskFiles = (number | null)[];

class DiskMap {
	// disk as a char array to be able to mutate it directly
	constructor(public disk: DiskFiles) {}

	makeCompact() {
		let firstEmptyIndex = 0;
		let lastBlockIndex = this.disk.length - 1;

		while (firstEmptyIndex < lastBlockIndex) {
			if (this.disk[firstEmptyIndex] != null) {
				firstEmptyIndex++;
				continue;
			}

			if (this.disk[lastBlockIndex] == null) {
				lastBlockIndex--;
				continue;
			}

			// Move last block back
			this.disk[firstEmptyIndex] = this.disk[lastBlockIndex];
			this.disk[lastBlockIndex] = null;
		}
	}

	checkSum(): number {
		let sum = 0;

		for (let i = 0; i < this.disk.length; i++) {
			const block = this.disk[i];
			if (block == null) continue;

			sum += i * block;
		}

		return sum;
	}

	toString(): string {
		const strArr: string[] = [];

		for (const block of this.disk) {
			if (block == null) {
				strArr.push(".");
			} else {
				strArr.push((block % 10).toString());
			}
		}

		return strArr.join("");
	}

	static fromDenseString(denseMap: string): DiskMap {
		const disk: DiskFiles = [];

		let file = true;
		let nextFileId = 0;

		for (const char of denseMap) {
			const blockSize = parseInt(char);

			if (file) {
				const newBlocks = [...Array(blockSize)].map((_) => nextFileId);
				disk.push(...newBlocks);
				nextFileId++;
			} else {
				const newBlocks = [...Array(blockSize)].map((_) => null);
				disk.push(...newBlocks);
			}

			file = !file;
		}

		return new DiskMap(disk);
	}
}

function shrimpFragmenter(inputFile: string) {
	const input = readFileSync(`src/day9/${inputFile}`).toString().trim();

	// const disk = DiskMap.fromDenseString("12345");
	const disk = DiskMap.fromDenseString(input);
	disk.makeCompact();
	// console.log(disk.toString());

	console.log("Checksum", disk.checkSum());
}

// shrimpFragmenter("input_test");
shrimpFragmenter("input");
