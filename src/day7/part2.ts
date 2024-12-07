// I think we can make this additional operator work seamlessly by adjust
// the base solving logic.
// (Just need to change operator increment, num of combinations and equation solving )

// The question is : is brute force still OK ?
// The possibilities are now 3^(operators.length)

// HELL YEA IT TOTALLY IS
// FISRST TRY BABYYYYYYYYYYYYYY
// PART 2 IN 10 MIN LETS FUCKING GO
// :D

import { readFileSync } from "fs";

type CalOperators = ("+" | "*" | "||")[];

function makeFirstCalOperators(length: number): CalOperators {
	return Array(length).fill("+");
}

/**
 * Gets the "next" string of operators, by incrementing it kind of like a binary number
 */
function incrementCalOperators(operators: CalOperators): CalOperators {
	// Example
	// +++
	// *++
	// |++
	// +*+
	// **+
	// |*+
	// +|+

	const newOperators = [...operators];

	for (let i = 0; i < operators.length; i++) {
		if (newOperators[i] == "+") {
			newOperators[i] = "*";
			break;
		} else if (newOperators[i] == "*") {
			newOperators[i] = "||";
			break;
		} else if (newOperators[i] == "||") {
			newOperators[i] = "+";
		}
	}

	return newOperators;
}

function testOperators() {
	let op: CalOperators = ["+", "+", "+"];

	const combinations = 3 ** op.length;

	console.log("combinations", combinations);

	for (let i = 0; i < combinations + 1; i++) {
		console.log(op);
		op = incrementCalOperators(op);
	}
}

class CalibrationEquation {
	constructor(public testVal: number, public operands: number[]) {}

	get operatorsCount() {
		return this.operands.length - 1;
	}

	applyOperators(operators: CalOperators): number {
		let result = this.operands[0];

		for (let i = 0; i < operators.length; i++) {
			if (operators[i] == "+") {
				result += this.operands[i + 1];
			} else if (operators[i] == "*") {
				result *= this.operands[i + 1];
			} else {
				result = parseInt("" + result + this.operands[i + 1]);
			}
		}

		return result;
	}

	isSolvedWithOperators(operators: CalOperators): boolean {
		return this.applyOperators(operators) == this.testVal;
	}

	isSolvable(): boolean {
		let operators = makeFirstCalOperators(this.operatorsCount);

		const operatorsCombinations = 3 ** this.operatorsCount;

		for (let i = 0; i < operatorsCombinations; i++) {
			if (this.isSolvedWithOperators(operators)) return true;

			operators = incrementCalOperators(operators);
		}

		return false;
	}

	toString() {
		return `${this.testVal}: ${this.operands.join(" ")}`;
	}

	static fromString(equation: string): CalibrationEquation {
		const eqSplit = equation.split(": ");
		const testVal = parseInt(eqSplit[0]);
		const operands = eqSplit[1].split(" ").map((n) => parseInt(n));

		return new CalibrationEquation(testVal, operands);
	}
}

function testSolve() {
	const cal = new CalibrationEquation(3267, [81, 40, 27]);
	console.log(cal);
	console.log(cal.applyOperators(["+", "+"]), cal.isSolvedWithOperators(["+", "+"]));
	console.log(cal.applyOperators(["*", "*"]), cal.isSolvedWithOperators(["*", "*"]));
	console.log(cal.applyOperators(["+", "*"]), cal.isSolvedWithOperators(["+", "*"]));
	console.log(cal.applyOperators(["*", "+"]), cal.isSolvedWithOperators(["*", "+"]));

	const cal2 = new CalibrationEquation(156, [15, 6]);
	console.log(cal2);
	console.log(cal2.applyOperators(["||"]), cal2.isSolvedWithOperators(["||"]));
}

async function bridgeRepair(inputFile: string) {
	const input = readFileSync(`src/day7/${inputFile}`).toString();

	const inputLines = input.split(/[\r]*[\n]/).filter((l) => l.length > 0);

	const equations: CalibrationEquation[] = inputLines.map((equationStr) =>
		CalibrationEquation.fromString(equationStr)
	);

	let calibrationResult = 0;

	for (const equation of equations) {
		const solvable = equation.isSolvable();

		if (solvable) {
			console.log("SOLVED -- " + equation.toString());
			calibrationResult += equation.testVal;
		}
	}
	console.log("Calibration Result", calibrationResult);
}

// testOperators();
// testSolve();

// bridgeRepair("input_test");
bridgeRepair("input");
