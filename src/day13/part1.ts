// This can be represented by 2 equations like ax + by = c
// (One equation on the X axis, one on the Y axis)
// We need to find x and y for which both equations are solved
// Did a bit of reading, apparently these are called Diophantine equations,
// they have many solutions and there are ways to represent these, and calculations
// involving GCD and shit

// Before diving into all that I have an idea that doesn't sound too bad:
// - Have the biggest operand first (swap a and b if a < b)
// - Start with the highest x for which ax + b(0) < c
// - while x > 0
// 		- Increment y until ax + by >= c
// 		- Decrement x

// Use this to find solutions for the first equation (X axis), and throw away
// any solution that doesn't also solve the Y axis equation

// Hey, it works !
// Didn't expect my sleep deprived maths to actually do something useful

import { readFileSync } from "fs";

function solutionCost(solution: { a: number; b: number }) {
	return 3 * solution.a + solution.b;
}

class ClawEquation {
	constructor(
		public buttA: { x: number; y: number },
		public buttB: { x: number; y: number },
		public prize: { x: number; y: number }
	) {}

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

	findSolutions(): { a: number; b: number }[] {
		let solutions: { a: number; b: number }[] = [];

		let x = Math.floor(this.prize.x / this.buttA.x);
		let y = 0;

		// a must be greater than b
		let a = this.buttA.x;
		let b = this.buttB.x;
		let flipped = false;
		if (a < b) {
			flipped = true;
			a = this.buttB.x;
			b = this.buttA.x;
		}

		while (x > 0) {
			while (a * x + b * y < this.prize.x) {
				y++;
			}

			if (flipped) {
				if (this.isSolved(y, x)) solutions.push({ a: y, b: x });
			} else {
				if (this.isSolved(x, y)) solutions.push({ a: x, b: y });
			}

			x--;
		}

		return solutions;
	}

	cheapestSolution(): { a: number; b: number } | undefined {
		const solutions = [...this.findSolutions()];
		if (solutions.length == 0) return;

		solutions.sort((solA, solB) => solutionCost(solA) - solutionCost(solB));

		return solutions[0];
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

function testSolve() {
	// First example
	const eq = new ClawEquation({ x: 94, y: 34 }, { x: 22, y: 67 }, { x: 8400, y: 5400 });
	console.log(eq.isSolved(80, 40));
}

function clawMachines(inputFile: string) {
	const input = readFileSync(`src/day13/${inputFile}`).toString().trim();
	const eqationsStr = input.split(/(\r?\n){2}/).filter((eq) => eq.length > 1);

	const equations = eqationsStr.map((eqStr) => ClawEquation.fromString(eqStr));

	let totalTokens = 0;

	for (const eq of equations) {
		console.log(eq);
		const solution = eq.cheapestSolution();
		if (solution) {
			totalTokens += solutionCost(solution);
			console.log(solution, solutionCost(solution));
		}
	}

	console.log("Total tokens", totalTokens);
}

// testSolve();

// clawMachines("input_test");
clawMachines("input");
