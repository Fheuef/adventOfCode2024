// Gonna start with something slow but seemingly easy :
// - Find the largest unmoved file ID and its blocks
// - Find the first empty block before the file that can fit its size
// - Move the file blocks
//
// Then just keep track of the file ID to find the one before and repeat.

// Well, it may not be the fastest but it works ! (first try too)
// That's good enough for today

import { readFileSync } from "fs";

type DiskFiles = (number | null)[];

class DiskMap {
	// disk as a char array to be able to mutate it directly
	constructor(public disk: DiskFiles) {}

	makeCompact() {
		let highestMovedFile: number | undefined;

		while (highestMovedFile == undefined || highestMovedFile > 0) {
			const fileToMove = this.findHighestIdFile(highestMovedFile);
			const fileFirstId = fileToMove[0];
			const fileLastId = fileToMove[1];
			const fileSize = fileLastId - fileFirstId + 1;

			highestMovedFile = this.disk[fileFirstId] as number;

			const targetBlock = this.findEmptyBlock(fileSize, fileFirstId);
			if (targetBlock == undefined) continue;

			this.moveBlocks(fileFirstId, fileLastId, targetBlock);
		}
	}

	/**
	 * Finds the file with the highest ID (< a given maximum), and
	 * returns the indices of its first and last blocks
	 */
	findHighestIdFile(maxId?: number): number[] {
		let highestId = 0;

		let fileStart = 0;
		let fileEnd = 0;

		for (let i = 0; i < this.disk.length; i++) {
			const block = this.disk[i];
			if (block == null) continue;
			if (maxId != undefined && block >= maxId) continue;

			if (block > highestId) {
				highestId = block;
				fileStart = i;
			}

			if (block == highestId) {
				fileEnd = i;
			}
		}

		return [fileStart, fileEnd];
	}

	/**
	 * Tries to find the first block with a minimum size, under a given index.
	 *
	 * @returns the first index of the block if one is found.
	 */
	findEmptyBlock(minSize: number, maxId: number): number | undefined {
		let blockStart: number | undefined;

		for (let i = 0; i < maxId; i++) {
			const block = this.disk[i];

			if (block == null) {
				if (blockStart == undefined) {
					blockStart = i;
				}

				const blockSize = i - blockStart + 1;

				if (blockSize >= minSize) {
					return blockStart;
				}
			} else {
				blockStart = undefined;
			}
		}
	}

	moveBlocks(firstBlockId: number, lastBlockId: number, destination: number) {
		const blocksSize = lastBlockId - firstBlockId + 1;

		for (let i = 0; i < blocksSize; i++) {
			this.disk[destination + i] = this.disk[firstBlockId + i];
			this.disk[firstBlockId + i] = null;
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
