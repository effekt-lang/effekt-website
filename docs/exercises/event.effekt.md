# Exercise 3: 'Event'

```effekt:hide
// This part is hidden on the website.
import tty

/// `filter` on `List`s, written using `list::collect`
/// Use as `list.filter { elem => elem > 0 }`
def filter[A](list: List[A]) { keep: A => Bool }: List[A] =
  list.collect {
    case elem and keep(elem) => Some(elem) // "lambda case"
    case _                   => None()
  }

def todo(): Unit = ()
def todo[R](): Option[R] = None()
def todo[R](): List[R] = Nil()
def todo(): Int = 42
```

First, let's write a type alias for a "callback":
```effekt
// A callback is a first-class function `String => Unit`
// where the body can use `io` (= call println).
// The String argument is some "data" payload.
//
// Note that it cannot have any effects!
type Callback = String => Unit / {} at {io}
```

Our goal today will be to write a naive version of a JavaScript-style event loop.

There are three things we can do when working with events:
1. add an event listener (a new callback for a given event)
2. remove all event listeners for a given event
3. emit an event and its associated data
```effekt
interface Event {
  def addEventListener(event: String, callback: Callback): Unit
  def removeEventListeners(event: String): Unit
  def emit(event: String, data: String): Unit
}
```

### Task: implement the event loop

Implement (a very basic version of) the event loop (a handler for `() => Unit / Event`)
You'll need to model a event listener and their storage
(a mutable variable containing a list is completely fine).
1. `addEventListener`: simply adds a new event listener to the storage
2. `removeEventListeners`: removes all listeners with a given event (Hint: use `filter`!)
3. `emit`: for each event listener where the event name matches, call the callback on the data!

> Hints:
> - Do NOT forget to `resume`! `;)`
> - If the automatic boxing/unboxing doesn't seem to work,
>   use explicit `box` and `unbox` operators.

```effekt
// Define your model of an event listener here
def eventloop { prog: () => Unit / Event }: Unit = {
  // Define the storage of your event listeners here

  try {
    prog()
  } with Event {
    def addEventListener(event: String, callback: Callback) = {
      todo()
    }

    def removeEventListeners(event: String) = {
      todo()
    }

    def emit(event: String, data: String) = {
      todo()
    }
  }
}
```

### Running

The following `example` should print:
> Click event: Button clicked!
> Hover event: Mouse over button
> Hover event: Another hover

```effekt
def example() = eventloop {
  def handleClick(data: String): Unit = {
    println("Click event: " ++ data)
  }

  def handleHover(data: String): Unit = {
    println("Hover event: " ++ data)
  }

  do addEventListener("click", box handleClick)
  do addEventListener("hover", box handleHover)

  do emit("click", "Button clicked!")
  do emit("hover", "Mouse over button")

  do removeEventListeners("click")

  // This won't trigger handleClick since all `click`s were removed
  do emit("click", "Another click")

  // This will still work (`hover`s were not removed)
  do emit("hover", "Another hover")
}
```

```effekt:repl
example()
```