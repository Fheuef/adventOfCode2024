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

function totalDistanceInLists(list1: number[], list2: number[]) {
	const sortedList1 = [...list1].sort();
	const sortedList2 = [...list2].sort();

	let distance = 0;

	for (let i = 0; i < sortedList1.length; i++) {
		const num1 = sortedList1[i];
		const num2 = sortedList2[i];

		const dist = Math.abs(num1 - num2);
		distance += dist;
	}

	return distance;
}

const testLists = getListsFromInput(testInput);
const testDistance = totalDistanceInLists(testLists[0], testLists[1]);

console.log("Test distance", testDistance);

// ---

const input = readFileSync("day1/input.txt").toString();

const lists = getListsFromInput(input);
const distance = totalDistanceInLists(lists[0], lists[1]);

console.log("Test distance", distance);
