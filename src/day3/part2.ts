import { readFileSync } from "fs";

function multProgram(inputFile: string) {
	const input = readFileSync(`src/day3/${inputFile}`).toString();

	const instructionsRegex = /(mul\(\d{1,3},\d{1,3}\))|(do\(\))|(don't\(\))/g;

	const instructions = input.match(instructionsRegex);

	if (!instructions) {
		console.log(0);
		return;
	}

	let sum = 0;
	let multEnabled = true;

	for (const inst of instructions) {
		if (inst == "do()") multEnabled = true;
		else if (inst == "don't()") multEnabled = false;
		else if (multEnabled) {
			sum += computeMul(inst);
		}
	}

	console.log("Sum of valid mults", sum);
}

function computeMul(mulOperation: string): number {
	const numbers = mulOperation.substring(4, mulOperation.length - 1).split(",");

	if (numbers.length != 2) return 0;

	return parseInt(numbers[0]) * parseInt(numbers[1]);
}

// multProgram("input_test2");
multProgram("input");
