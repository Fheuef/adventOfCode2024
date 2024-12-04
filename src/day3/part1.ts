import { readFileSync } from "fs";

function multProgram(inputFile: string) {
	const input = readFileSync(`src/day3/${inputFile}`).toString();

	const mulRegex = /mul\(\d{1,3},\d{1,3}\)/g;

	const validMuls = input.match(mulRegex);
	// console.log(validMuls);

	if (!validMuls) {
		console.log(0);
		return;
	}

	let sum = 0;

	for (const mul of validMuls) {
		sum += computeMul(mul);
	}

	console.log("Sum of valid mults", sum);
}

function computeMul(mulOperation: string): number {
	const numbers = mulOperation.substring(4, mulOperation.length - 1).split(",");

	if (numbers.length != 2) return 0;

	return parseInt(numbers[0]) * parseInt(numbers[1]);
}

// multProgram("input_test");
multProgram("input");
