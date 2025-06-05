---
layout: docs
title: Exercise 'Sudoku'
permalink: docs/exercises/sudoku
---

# Exercise 2: 'Sudoku'

```effekt:prelude
import test
import tty
```

```effekt:hide
// This part is hidden on the website.

// Use this to ignore a test
def ignore(name: String){ body: () => Unit / { Assertion } }: Unit = ()

def assertNonempty(s: String) = {
  val isEmpty = s == ""
  do assert(not(isEmpty), Formatted::tryEmit(Escape::RESET) ++ "Expected: nonempty string\n  Obtained: ".dim ++ "\"\"".red)
}

def assertNonzero(n: Int) = {
  val isZero = n == 0
  do assert(not(isZero), Formatted::tryEmit(Escape::RESET) ++ "Expected: nonzero number\n  Obtained: ".dim ++ show(n).red)
}

def tests { body: => Unit / { Test, Formatted } }: Bool = {
  with Formatted::noFormatting;

  var failed = 0
  var passed = 0

  // 2) Run the tests
  try { body() } with Test {
    // 2a) Handle a passing test on success
    def success(name, duration) = {
      passed = passed + 1
      println("✓".green ++ " " ++ name)
      resume(())
    }

    // 2b) Handle a failing test on failure, additionally printing its message
    def failure(name, msg, duration) = {
      failed = failed + 1
      println("✕".red ++ " " ++ name)
      println("  " ++ msg.red)
      resume(())
    }
  }

  // 3) Format the test results
  println("")
  println(" " ++ (passed.show ++ " pass"))
  println(" " ++ (failed.show ++ " fail"))
  println(" " ++ (passed + failed).show ++ " tests total")

  // 4) Return true if all tests succeeded, otherwise false
  return failed == 0
}

// TODOs that don't crash
def todo[R](): Option[R] = None()
def todo[R](): List[R] = Nil()
def todo(): Int = 42
```

## Sudoku

### Prerequisites

`break` is a helper effect that allows us to return a value quickly from a block of code.
It's not strictly necessary to use it, it's only used here as a convenience for the template :)
```effekt
effect break[T](value: T): Unit

def boundary[T] { prog: => T / break[T] } =
  try prog() with break[T] { value => value }

def someBoundary[T] { prog: => Unit / break[T] } =
  try {
    val _ = prog()
    None()
  } with break[T] { value => Some(value) }
```

Let's define a 4x4 Sudoku board.
We'll use the type alias / synonym `Board` to refer to a list of lists of numbers.
(Yes, this is neither an efficient nor a type-safe representation, it's just somewhat simple.)


```effekt
type Board = List[List[Int]]
```

Invariants for the board:
1. the lists are always of length exactly `4`
2. the numbers inside will always be either `1-4` (as a solution) or `0` (as a empty/placeholder value)

### Internals

Here are some internal functions, you don't need to understand these,
so feel free to skip over this section :)
There are a few comments, but you can mostly trust that it Just Works ™️
```effekt
namespace board {
  /// Prints the board nicely onto standard output
  def print(board: Board): Unit = {
    board.foreachIndex { (r, row) =>
      if (r.mod(2) == 0) {
        println("+------+------+")
      }

      var accum = ""
      row.foreachIndex { (c, value) =>
        if (c.mod(2) == 0) {
          accum = accum ++ "|"
        }
        val prettyValue = if (value == 0) { "·" } else { value.show }

        accum = accum ++ " " ++ prettyValue ++ " "
      }
      println(accum ++ "|")
    }
    println("+------+------+")
  }

  /// Updates the board at coords (row, col) with the given updating function
  /// that takes the previous value and returns the new one.
  /// The whole function returns a new board.
  def updated(board: Board, row: Int, col: Int) { updater: Int => Int }: Board =
    board.updateAt(row) { r =>
      r.updateAt(col) {
        updater
      }
    }

  /// Returns the given `row` in `board` as a list.
  def rowOf(board: Board, row: Int, _col: Int): List[Int] / {} = {
    with on[OutOfBounds].panic
    board.get(row)
  }

  /// Returns the given `col` in `board` as a list.
  def colOf(board: Board, _row: Int, col: Int): List[Int] = {
    with on[OutOfBounds].panic
    board.map { r => r.get(col) }
  }

  /// Returns the 2x2 box at `(row, col)` in `board` as a flat list.
  def boxOf(board: Board, row: Int, col: Int): List[Int] = {
    with on[OutOfBounds].panic
    // Note: this is _not_ equivalent to `boxRowStart = row` because of integer divison!
    val boxRowStart = (row / 2) * 2;
    val boxColStart = (col / 2) * 2;

    [ board.get(boxRowStart    ).get(boxColStart    ),
      board.get(boxRowStart + 1).get(boxColStart    ),
      board.get(boxRowStart    ).get(boxColStart + 1),
      board.get(boxRowStart + 1).get(boxColStart + 1)
    ]
  }

  /// Checks if the `solution` is truly a valid solution for the given initial `puzzle`
  /// This is not really exhaustive, but it's at least something.
  def checkSolution(puzzle: Board, solution: Board): Bool = boundary[Bool] {
    // Solution has no empty spaces
    solution.foreachIndex { (r, row) =>
      row.foreachIndex { (c, value) =>
        if (value == 0) {
          println("A")
          do break(false)
        }
      }
    }

    // Solution subsumes puzzle
    each(0, 4) { row =>
      each(0, 4) { col =>
        with on[OutOfBounds].panic
        val valueSolution = solution.get(row).get(col)
        val valuePuzzle = puzzle.get(row).get(col)
        if (valuePuzzle != 0 && valuePuzzle != valueSolution) {
          println("C")
          do break(false)
        }
      }
    }

    true
  }
}
```

### Solver

Next up is the effect we'll use for backtracking.
It has two different operations:
- return a valid digit (so one of `1`, `2`, `3`, `4`)
- fail the current branch of computation

```effekt
/// Search effect
interface Search {
  /// Pick a random _valid_ digit (= 1, 2, 3, 4)
  def pickDigit(): Int

  /// Fail the backtracking search
  def fail(): Nothing
}
```

The next thing is a simple function that checks if it's valid to put a given `num`
into the specified coordinates on the `board`.
For slight clarity, I use the `boundary` handler and the `break` effect,
but they're not strictly necessary.
```effekt
/// Returns true if it's valid to place num at (row, col)
def valid?(board: Board, row: Int, col: Int, num: Int): Bool = boundary {
  // Check row
  if (board::rowOf(board, row, col).any { x => x == num }) {
    do break(false)
  }

  // Check column
  if (board::colOf(board, row, col).any { x => x == num } ) {
    do break(false)
  }

  // Check 2x2 box
  if (board::boxOf(board, row, col).any { x => x == num } ) {
    do break(false)
  }

  true
}
```

Simple function to find the next free space (represented by a list cell containing `0`) if there is some.
```effekt
/// Find next empty cell
def findEmpty(board: Board): Option[(Int, Int)] = someBoundary {
  board.foreachIndex { (r, row) =>
    row.foreachIndex { (c, value) =>
      if (value == 0) do break((r, c))
    }
  }
}
```

Finally, the solver itself!
It has been commented in a lot of detail,
but this is the one function that you really ought to understand!

Please take enough time to understand what it's supposed to do.
The `Search` effect is, of course, not handled here, but it is being used to search the possible state space.
As a reminder, the `pickDigit` is an interface for "pick a digit between `1` and `4`"
and the `fail` is an interface for terminating this branch of search.
```effekt
/// Try to solve the given `board`, returning a new board.
/// Uses the `Search` effects to do backtracking.
def solve(board: Board): Board / Search = {
  // 1. Try to find an empty spot on the board.
  //    If there isn't any, end the search successfully.
  findEmpty(board) match {
    case None() => board  // <- Solution found!

    // 2. If you find an empty spot on the board, pick a new digit.
    //    If it's valid to put it there, do so and continue solving.
    //    Otherwise, fail this backtracking search.
    case Some((row, col)) => {
      val newDigit = do pickDigit()
      if (board.valid?(row, col, newDigit)) {
        // newBoard[row, col] := newDigit
        val newBoard = board::updated(board, row, col) { _ => newDigit }

        solve(newBoard)
      } else {
        do fail()
      }
    }
  }
}
```

Finally, here's your task.
You'll be writing three different handlers for the `Search` effect used in `solve`.
Don't forget to `resume` in the effects where you want to resume ;)

Note that the _return_ type of `resume` is always the same as the return type of the inside `...` in `try { ... }`.
In this case, it's the same as the return type of the outer function.
Use this to guide your implementation.

The inside of the `try { ... }` has been provided and should work fine.

### Task 1. Count all the solutions

First, return how many solutions there actually are in total.
Failure means zero solutions exists on the given branch.
If there are multiple options, don't forget to sum them up!

Please don't use `findAllSolutions` as a subroutine, write the handler from scratch.

> **Hint:** the `each` function from the standard library might be helpful.
> `each(fromInclusive: Int, toExclusive: Int) { (x: Int) => ... }`, used as `each(0, 4) { i => ... }`
>
> You'll also find it used in this very file, so feel free to get inspired ;)
>
> Additional hint: we recommend using a mutable variable scoped in the handler of `pickDigit`.

```effekt
/// Handler that counts all solutions
def countSolutions(initial: Board): Int =
  try {
    solve(initial)
    1
  } with Search {
    def fail() = todo()      // TODO
    def pickDigit() = todo() // TODO
  }
```


### Task 2. Find all solutions

Next, return all of the possible solutions. When you do, return them as a list.
If there are no solutions, return an empty list.

```effekt
/// Handler that finds all solutions
def findAllSolutions(initial: Board): List[Board] =
  try {
    [ solve(initial) ]
  } with Search {
    def fail() = todo()      // TODO
    def pickDigit() = todo() // TODO
  }
```

### Task 3. Find first solution

Finally, find the first possible solution. When you do, return it as `Some(solution)`
If there's no solution, return `None()`.

```effekt
/// Handler that finds first solution
def findSolution(initial: Board): Option[Board] =
  try {
    Some(solve(initial))
  } with Search {
    def fail() = todo()      // TODO
    def pickDigit() = todo() // TODO
  }
```


---

### Example usage

Here's an example you can run in the REPL (below):

```effekt
def example(): Unit = {
  val puzzle = [
    [0, 0, 2, 0],
    [0, 0, 0, 1],
    [0, 1, 0, 0],
    [4, 0, 0, 0]
  ]
  board::print(puzzle)
  println("")

  println("Finding a solution:")
  findSolution(puzzle) match {
    case Some(solution) =>
      val isGood = board::checkSolution(puzzle, solution)
      if (isGood) {
        println("... it's OK!")
      } else {
        println("... it's bad! ERROR!")
      }

      board::print(solution)
      println("")
    case None() => println("No solution exists!")
  }
  println("")

  println("Finding all solutions:")
  findAllSolutions(puzzle).foreach { solution =>
    val isGood = board::checkSolution(puzzle, solution)
      if (isGood) {
        println("... it's OK!")
      } else {
        println("... it's bad! ERROR!")
      }

      board::print(solution)
      println("")
  }
  println("")

  println("Number of solutions: " ++ countSolutions(puzzle).show)
}
```

```effekt:repl
example()
```

### Tests

Tests live here:

```effekt
def assertSolutionExists(maybeSolution: Option[Board], board: Board): Unit / { Assertion, Formatted } =
  maybeSolution match {
    case Some(solution) =>
      do assert(board::checkSolution(board, solution), "Solution found, but not valid!")
    case None() =>
      do assert(false, "Expected a solution, but found no solutions")
  }

def assertNoSolution(maybeSolution: Option[Board], board: Board): Unit / { Assertion, Formatted } =
  maybeSolution match {
    case Some(solution) =>
      do assert(false, "Expected no solution, found a solution!")
    case None() =>
      do assert(true, "Expected no solution, found no solution")
  }

def assertNumberOfSolutions(obtained: Int, expected: Int): Unit / { Assertion, Formatted } = {
  def plural(s: String, n: Int) = s ++ (if (n == 1) "" else "s")

  do assert(obtained == expected,
    Formatted::tryEmit(Escape::RESET) ++
    "Expected: ".dim ++ show(expected).green ++ " " ++ "solution".plural(expected) ++
    "\n  Obtained: ".dim ++ show(obtained).red ++ " " ++ "solution".plural(obtained)
  )
}

def assertSolutions(obtained: List[Board], expected: List[Board]): Unit / { Assertion, Formatted } = {
  expected.foreach { expectedSolution =>
    var seen = false
    obtained.foreach { obtainedSolution =>
      if (obtainedSolution.equals(expectedSolution)) {
        seen = true
      }
    }
    do assert(seen, "Expected to see solution " ++ expectedSolution.genericShow ++ ", but didn't find it in obtained solutions!")
  }

  obtained.foreach { obtainedSolution =>
    var seen = false
    expected.foreach { expectedSolution =>
      if (obtainedSolution.equals(expectedSolution)) {
        seen = true
      }
    }
    do assert(seen, "Unexpected solution " ++ obtainedSolution.genericShow ++ "!")
  }

  do assert(true, "All solutions found")
}

def testSuite(): Bool = tests {
  val filledSudoku: Board = [
    [1, 4, 2, 3],
    [3, 2, 4, 1],
    [2, 1, 3, 4],
    [4, 3, 1, 2]
  ]

  test("sudoku: filled correctly: find one correct solution") {
    assertSolutionExists(findSolution(filledSudoku), filledSudoku)
  }

  test("sudoku: filled correctly: count all solutions") {
    assertNumberOfSolutions(countSolutions(filledSudoku), 1)
  }

  test("sudoku: filled correctly: find all correct solutions") {
    assertSolutions(findAllSolutions(filledSudoku), [ filledSudoku ])
  }

  // ---

  val impossibleSudoku: Board = [
    [1, 4, 2, 3],
    [3, 2, 4, 1],
    [2, 1, 3, 4],
    [0, 4, 1, 2]
  ]

  test("sudoku: impossible: find no correct solution") {
    assertNoSolution(findSolution(impossibleSudoku), impossibleSudoku)
  }

  test("sudoku: impossible: count all (= no) solutions") {
    assertNumberOfSolutions(countSolutions(impossibleSudoku), 0)
  }

  test("sudoku: impossible: find all (= no) correct solutions") {
    assertSolutions(findAllSolutions(impossibleSudoku), [ ])
  }

  // ---

  val exampleSudoku = [
    [0, 0, 2, 0],
    [0, 0, 0, 1],
    [0, 1, 0, 0],
    [4, 0, 0, 0]
  ]

  test("sudoku: example: find one correct solution") {
    assertSolutionExists(findSolution(exampleSudoku), exampleSudoku)
  }

  test("sudoku: example: count all solutions") {
    assertNumberOfSolutions(countSolutions(exampleSudoku), 2)
  }

  test("sudoku: example: find all correct solutions") {
    assertSolutions(findAllSolutions(exampleSudoku), [ filledSudoku, [[1, 3, 2, 4], [2, 4, 3, 1], [3, 1, 4, 2], [4, 2, 1, 3]] ])
  }

  // ---

  val diagonalBoard = [
    [1, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 3, 0],
    [0, 0, 0, 4]
  ]

  test("sudoku: diagonal board: find one correct solution") {
    assertSolutionExists(findSolution(diagonalBoard), diagonalBoard)
  }

  test("sudoku: diagonal board: count all solutions") {
    assertNumberOfSolutions(countSolutions(diagonalBoard), 2)
  }

  test("sudoku: diagonal board: find all correct solutions") {
    val solution1 = [ [1, 3, 4, 2], [4, 2, 1, 3], [2, 4, 3, 1], [3, 1, 2, 4] ]
    val solution2 = [ [1, 4, 2, 3], [3, 2, 4, 1], [4, 1, 3, 2], [2, 3, 1, 4] ]
    assertSolutions(findAllSolutions(diagonalBoard), [ solution1, solution2 ])
  }

  // ---

  val emptyBoard = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]

  test("sudoku: empty board: find one correct solution") {
    assertSolutionExists(findSolution(emptyBoard), emptyBoard)
  }

  test("sudoku: empty board: count all solutions") {
    // 4!×2×2×3 == 288; https://pi.math.cornell.edu/~mec/Summer2009/Mahmood/Four.html#:~:text=So%20the%20number%20of%20distinct,×2×3%3D288.
    assertNumberOfSolutions(countSolutions(emptyBoard), 288)
  }

  test("sudoku: empty board: find all correct solutions") {
    assertNumberOfSolutions(findAllSolutions(emptyBoard).size, 288)
  }
}
```


```effekt:repl
testSuite()
```

---

[Back to Exercises](/docs/exercises)

