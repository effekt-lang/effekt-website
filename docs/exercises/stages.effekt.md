# Exercise 1b: 'Research Stages'

Here's some F# code shared on the internet that people use to prove how cool the F# language is:
```fs
let getResearchStages (project: Project) = // -> option<list<string>>
  optional {
    let! phase = project.experimentalPhase
    let stage = phase.phaseName
    let latest = phase.latestExperiment

    match latest with
    | None -> return [ stage ]
    | Some latest -> return [ stage, latest.experimentName ]
  }
```

Your goal is to write a `getResearchStages` function in Effekt.
Let's start with the data definitions:

```effekt
record Project(experimentalPhase: Option[Phase])
record Phase(phaseName: String, latestExperiment: Option[Experiment])
record Experiment(experimentName: String)
```

Now we'll need to define the equivalents to `optional` and `!`.
Let's first think about what they do:
- `optional { ... }`
  - is a _handler_ for some block which can trigger an early exit effect
    - if it does, it returns `None()`
    - if not, it wraps the result into a `Some(...)`
- `let! x = y` (could be written as `val x = y.unwrap()` in Rust, for example)
  - is a helper function which tries to unwrap a `Option[T]`
    - if it's a `Some(...)`, it returns the contents
    - if it's a `None()`, then it performs an early exit effect caught by `optional`.

This provides a possible plan of action:
1. define an early exit effect
2. define `optional` as a function that receives a block
3. define the `!` helper under some name of your choice
4. transcribe the F# example above in Effekt:

Go ahead!
```effekt
// put code described above ^ here:

def getResearchStages(project: Project) = {
  <> // TODO
}
```

Here's some test data:
```effekt
def output(res: Option[List[String]]): String = res match {
  case None() => "None()"
  case Some(results) => "Some(" ++ results.join(", ") ++ ")"
}

def test1() = {
  val project1 = Project(None())
  getResearchStages(project1).output
}

def test2() = {
  val phaseWithExperiment = Phase("Phase with experiment", Some(Experiment("Foucault pendulum")))
  val project2 = Project(Some(phaseWithExperiment))
  getResearchStages(project2).output
}

def test3() = {
  val phaseWithoutExperiment = Phase("Phase without an experiment", None())
  val project3 = Project(Some(phaseWithoutExperiment))
  getResearchStages(project3).output
}
```

Here's where you can call `getResearchStages` on the three possible inputs:
```effekt:repl
test1()
```