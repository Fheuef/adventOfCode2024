import { readFileSync } from "fs";

const testInput = ["3   4", "4   3", "2   5", "1   3", "3   9", "3   3"].join("\n");

function getListsFromInput(input: string): number[][] {
	const list1: number[] = [];
	const list2: number[] = [];

	const inputLines = input.split(/[\r]*[\n]+/);

	for (const line of inputLines) {
		if (line.length == 0) continue;

		const nums = line.split(/[\s]+/);
		const leftNum = parseInt(nums[0].trim());
		const rightNum = parseInt(nums[1].trim());

		list1.push(leftNum);
		list2.push(rightNum);
	}

	return [list1, list2];
}

function numberOfOccurences(n: number, list: number[]): number {
	return list.reduce((acc, val) => (val == n ? acc + 1 : acc), 0);
}

function similarityScore(list1: number[], list2: number[]): number {
	let score = 0;

	for (const n of list1) {
		score += n * numberOfOccurences(n, list2);
	}

	return score;
}

const testLists = getListsFromInput(testInput);
const testSimilarity = similarityScore(testLists[0], testLists[1]);

console.log("Test similarity", testSimilarity);

// ---

const input = readFileSync("src/day1/input.txt").toString();

const lists = getListsFromInput(input);
const similarity = similarityScore(lists[0], lists[1]);

console.log("Similarity", similarity);
