# Exercise 1a: 'Hurl'

[Hurl](https://hurl.wtf) is an interesting programming language where exception handling is the only allowed control flow.
Here's an example of a program in Hurl:
```hurl
let factorial = func(n) {
  try {
    hurl n == 0;
  } catch (true) {
    hurl 1;
  } catch (false) {
    let next = 1;       // mutable
    try {
      factorial(n - 1);
    } catch into next;
    hurl n * next;
  };
};

try {
  factorial(10);
} catch as x {
  println("factorial(10) = ", x);
};
```

**Goal:** _Translate the program above into Effekt!_

Here are some smaller steps:
1. Define a `hurl` effect operation. Note that you need to be able to hurl both booleans and numbers.
   We'd recommend making the effect parametric in what you're throwing ("hurling").
2. Transcribe the `factorial` function using your very own `hurl` operation.
3. Transcribe the final `try { ... } catch as x { ... }` section into the `result()` so that you get some automated testing :)

```effekt
// 1. define the effect operation and any useful definitions here


// 2. put your code for factorial here
//    The type of factorial should be `Unit` and it should use the effect operation you defined


// 3. put the try { ... } catch as x { ... } here
//    (something like `try { factorial(10); "" } with ...` in Effekt)
//    You should return the string "factorial(10) = ..." here
//
// Don't change the return type or effect set please!
def result(): String / {} = {
  <> // TODO
}
```

Here's a REPL:

```effekt:repl
result()
```