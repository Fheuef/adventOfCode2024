// Hm, that looks like it's really not gonna work out

// Ok, since we have 2 equations maybe this can be solved as a system ?

// Tried something using the first example, let's hope my maths isn't too rusty

// 94x + 22y = 8400
// 34x + 67y = 5400
//
// 94x + 22y = 8400
// 67y = 5400 - 34x
//
// 94x + 22((5400 - 34x)/67) = 8400
// y = (5400 - 34x)/67
//
// ...

// Ok I couldn't manage to finish writing a general solution myself, but I found the equation
// that solves this system by plugging in all the constants, and it works perfectly !!

// Solved the part2 input pretty much instantly, so that's a win for today

import { readFileSync } from "fs";

function solutionCost(solution: { a: number; b: number }) {
	return 3 * solution.a + solution.b;
}

/**
 * ax + by = c
 *
 * dx + ey = f
 */
function solveSystem(
	a: number,
	b: number,
	c: number,
	d: number,
	e: number,
	f: number
): { x: number; y: number } | undefined {
	const detA = a * e - b * d;

	if (detA == 0) return undefined;

	// Determinants for the x and y solutions
	const det_Ax = c * e - b * f;
	const det_Ay = a * f - c * d;

	const x = det_Ax / detA;
	const y = det_Ay / detA;

	return { x, y };
}

class ClawEquation {
	constructor(
		public buttA: { x: number; y: number },
		public buttB: { x: number; y: number },
		public prize: { x: number; y: number }
	) {
		this.prize = { x: 10000000000000 + prize.x, y: 10000000000000 + prize.y };
	}

	result(aPresses: number, bPresses: number): { x: number; y: number } {
		return {
			x: this.buttA.x * aPresses + this.buttB.x * bPresses,
			y: this.buttA.y * aPresses + this.buttB.y * bPresses,
		};
	}

	isSolved(aPresses: number, bPresses: number): boolean {
		const result = this.result(aPresses, bPresses);
		return result.x == this.prize.x && result.y == this.prize.y;
	}

	findSolution(): { a: number; b: number } | undefined {
		const solution = solveSystem(
			this.buttA.x,
			this.buttB.x,
			this.prize.x,
			this.buttA.y,
			this.buttB.y,
			this.prize.y
		);

		if (!solution) return;
		if (!Number.isInteger(solution.x) || !Number.isInteger(solution.y)) return;

		return { a: solution.x, b: solution.y };
	}

	static fromString(equation: string): ClawEquation {
		const lines = equation.split("\n");

		const buttA = {
			x: parseInt((lines[0].match(/X\+\d+/) ?? ["0"])[0].replace("X+", "")),
			y: parseInt((lines[0].match(/Y\+\d+/) ?? ["0"])[0].replace("Y+", "")),
		};

		const buttB = {
			x: parseInt((lines[1].match(/X\+\d+/) ?? ["0"])[0].replace("X+", "")),
			y: parseInt((lines[1].match(/Y\+\d+/) ?? ["0"])[0].replace("Y+", "")),
		};

		const prize = {
			x: parseInt((lines[2].match(/X=\d+/) ?? ["0"])[0].replace("X=", "")),
			y: parseInt((lines[2].match(/Y=\d+/) ?? ["0"])[0].replace("Y=", "")),
		};

		return new ClawEquation(buttA, buttB, prize);
	}
}

function clawMachines(inputFile: string) {
	const input = readFileSync(`src/day13/${inputFile}`).toString().trim();
	const eqationsStr = input.split(/(\r?\n){2}/).filter((eq) => eq.length > 1);

	const equations = eqationsStr.map((eqStr) => ClawEquation.fromString(eqStr));

	let totalTokens = 0;

	for (const eq of equations) {
		console.log(eq);
		const solution = eq.findSolution();
		if (solution) {
			totalTokens += solutionCost(solution);
			console.log(solution, solutionCost(solution));
		}
	}

	console.log("Total tokens", totalTokens);
}

// clawMachines("input_test");
clawMachines("input");
