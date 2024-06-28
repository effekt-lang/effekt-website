---
title: Choreographic Programming
date: 2024-06-28
---

# Choreographic Programming

This is a quick (and pretty rough) attempt of implementing choreographic programming from the following paper in Effekt:

<https://arxiv.org/abs/2303.00924>

Please note:

- all processes will run on one machine (in the browser)
- the communication mechanism is very hacky
- enclaves are missing

Also, since we want to run each projection in a promise, all effects have to be handled before:

```effekt:sketch
val p1 = do promise(box {
  with network(channels);
  with catalog;

  epp([Exists(buyer), Exists(seller)], buyer) { bookseller(buyer, seller, budget) }
})
```

Furthermore, the interface at the moment is not really safe.

In particular, running locally on `buyer`, we can send a message to `seller`, who
will not be listening, since the `locally` block is only run on `buyer`.
Thus the message order will be confused.

```effekt:sketch
do locally(buyer) {
  // Oh oh oh (we send something, but nobody is listening...)
  do communicate(buyer, seller, msg1)
}

do communicate(buyer, seller, msg2) // here seller receives msg1!
```
Another issue is that processes could "sidechannel" using `io` (like global mutable state),
which works on a single process, but not when they are distributed (and thus changes semantics).

## The Choreo Library
Enough discussion, here now the implementation. If you just want to run it, scroll to the bottom of this page and hit `run`.

First, we define what it means for a value to be located on a machine:
```effekt:prelude:hide
import io
```

```effekt
// A location is indexed by a type to avoid confusing two locations
record Location[L](id: Int, name: String)

// Existential, required to talk about locations without knowing their type index.
type SomeLocation {
  Exists[L](l: Location[L])
}

// We compare locations by id
def infixEq[L1, L2](l1: Location[L1], l2: Location[L2]): Bool =
  (l1, l2) match {
    case (Location(id1, _), Location(id2, _)) => id1 == id2
  }

// A located value is only available on one machine
type Located[A, L] {
  Local(value: A)
  Remote()
}
```

```effekt:hide
```

Next, we define a few effects that make up the DSL of choreographic programming:
```effekt
// An effect to unwrap a located value on the machine where it is available
// (remark: this looks a bit like monadic reflection)
interface Unwrap[L] {
  def unwrap[A](l: Located[A, L]): A
}

// An effect that let's us know on which machine we are running at the moment
interface Here {
  def here(): SomeLocation
}

interface Choreo {
  // Runs the computation `p` on `l`. Since it runs on `l`, `p` has access
  // to locations on `l` via the Unwrap effect and the result will be located on l.
  def locally[A, L](l: Location[L]) { p: => A / Unwrap[L] }: Located[A, L]

  // Sends the value `a` from the sender `s` to the receiver `r`.
  def communicate[A, S, R](s : Location[S], r: Location[R], a: Located[A, S]): Located[A, R]

  // Sends the value `a` from location `l` to all other locations.
  // As a result, the value is available unconditionally.
  def broadcast[A, L](l: Location[L], a: Located[A, L]): A
}
```
## Example: Bookseller

To show how to program against the above API, we translate the bookseller
protocol from the above paper.

First, we need some auxiliary effects:
```effekt
// Used by the buyer to interact with the user
interface Input {
  def desiredBook(): String
  def availableBudget(): Int
}

// Used by the seller to look-up price and delivery date
type Date = String
interface Catalog {
  def price(title: String): Int
  def delivery(title: String): Date
}

// Used to log the transaction trace
interface Log {
  def log(msg: String): Unit
}
```

Now the actual protocol:
```effekt
def bookseller[Buyer, Seller](
  buyer: Location[Buyer],
  seller: Location[Seller]
): Located[Option[Date], Buyer] / { Choreo, Catalog, Input, Log } = {

  // (1) Get book title
  val titleBuyer = do locally(buyer) {
    do log("Asking for input on buyer")
    do desiredBook()
  };
  val titleSeller = do communicate(buyer, seller, titleBuyer);
  do log("Received title? " ++ genericShow(titleSeller))

  // (2) Look up price
  val priceSeller = do locally(seller) {
    do log("Searching for price on seller " ++ genericShow(titleSeller) ++ do unwrap(titleSeller))
    do price(do unwrap(titleSeller))
  }
  do log("After searching for price")

  val priceBuyer = do communicate(seller, buyer, priceSeller);
  do log("After sending price " ++ genericShow(priceBuyer))

  // (3) Check whether we can afford it
  val decisionBuyer = do locally(buyer) {
    do unwrap(priceBuyer) <= do availableBudget()
  }

  do log("Broadcasting decision: " ++ genericShow(decisionBuyer))
  val decision = do broadcast(buyer, decisionBuyer);

  if (decision) {
    // (4a) Find delivery date
    val deliverySeller = do locally(seller) {
      do log("Trying to order on seller")
      do delivery(do unwrap(titleSeller))
    }
    val deliveryBuyer = do communicate(seller, buyer, deliverySeller)
    do locally(buyer) {
      Some(do unwrap(deliveryBuyer))
    }
  } else {
    // (4b) End transaction
    do locally(buyer) { None() }
  }
}
```

## Endpoint Projection
To implement endpoint projection, we first need a few helper definitions.

First, we simulate network:
```effekt
interface Net {
  def send[A, L](value: A, receiver: Location[L]): Unit
  // this is sender in the paper, here we use the receiver to find the inbox
  def recv[A, L](receiver: Location[L]): A
}
```

The handler implementation of `Net` is a bit more involved, so we collapse it here:

<details>
<pre><code class="language-effekt">type AnyValue {
  Filled[A](value: A)
  Empty()
}

// Casts are not available in Effekt, so we need to hack it in, here.
extern pure def cast[A, B](value: A): B = js "${value}"

type Inboxes {
  Nil()
  Cons[L2](l: Location[L2], content: AnyValue, rest: Inboxes)
}

type Channels = Ref[Inboxes]
def get[L](ch: Channels, l: Location[L]): AnyValue = {
  def go(inboxes: Inboxes): AnyValue = inboxes match {
    case Nil() => Empty()
    case Cons(l2, content, rest) and l == l2 => content
    case Cons(l2, content, rest) => go(rest)
  }
  go(ch.get)
}

def set[L](ch: Channels, l: Location[L], value: AnyValue): Unit = {
  def go(inboxes: Inboxes): Inboxes = inboxes match {
    case Nil() => Cons(l, value, Nil())
    case Cons(l2, content, rest) and l == l2 => Cons(l2, value, rest)
    case Cons(l2, content, rest) => Cons(l2, content, go(rest))
  }
  ch.set(go(ch.get))
}


def network[R](channels: Channels) { prog: => R / Net }: R / Concurrent = {

  def tryWrite[A, L](value: A, receiver: Location[L]): Unit  = channels.get(receiver) match {
    case Filled(value) =>
      do yield()
      tryWrite(value, receiver)
    case Empty() =>
      channels.set(receiver, Filled(value));
  }

  def tryRead[A, L](receiver: Location[L]): A = channels.get(receiver) match {
    case Filled(value) =>
      channels.set(receiver, Empty())
      cast(value)
    case _ =>
      do yield()
      tryRead(receiver)
  }

  try { prog() }
  with Net {
    def send(value, receiver) = resume(tryWrite(value, receiver))
    def recv(receiver) = resume(tryRead(receiver))
  }
}
</code></pre>

</details>

Now we can implement endpoint projection using the network effect:

```effekt
type Locations = List[SomeLocation]

def tryUnwrap[A, L2](v: Located[A, L2]): A = v match {
  case Local(a) => a
  case Remote() => panic("Should not happen")
}

def epp[A, L](ls: Locations, here: Location[L]) { p: => A / Choreo }: A / Net = {

  def sendAll[A](ls: Locations, value: A): Unit =
    ls.foreach {
      case Exists(l) and l == here => ()
      case Exists(l) => do send(value, l);
    }

  try { p() }
  with Choreo {
    // This might look a bit strange: since locally receives a computation
    // as argument, we use our syntax for "bidirectional effects" and
    // send a computation back to the caller of `locally`.
    def locally[B, L2](l2) = resume { {f} =>
      try {
        if (here == l2) { Local(f()) } else Remote()
      } with Unwrap[L2] { def unwrap(v) = resume(tryUnwrap(v)) }
    }
    def communicate(s, r, a) = here match {
      case _ and here == s => do send(tryUnwrap(a), r); resume(Remote())
      case _ and here == r => resume(Local(do recv(r)))
      case _ => resume(Remote())
    }
    def broadcast(s, a) =
      if (here == s) { sendAll(ls, tryUnwrap(a)); resume(tryUnwrap(a)) }
      else { resume(do recv(here)) }
  }
}
```
## Implementing the domain handlers
As a next step, we need to implement handlers for our domain effects, like `Catalog`.
We use the following data as our catalog (feel free to change it):

<textarea id="catalog" style="width:750px; height:100px">{
  "TAPL": { "price" : 86, "delivery": "16.07.2024" },
  "Dragon Book": { "price" : 92, "delivery": "30.07.2024" }
}</textarea>


```effekt
extern js """
  function findItem(title) {
    const domEl = document.getElementById("catalog");
    const catalog = JSON.parse(domEl.value);
    return catalog[title] || { price: 0, delivery: "not available" }
  }
"""

extern io def getPriceFor(title: String): Int = js"findItem(${title}).price"
extern io def getDeliveryFor(title: String): String = js"findItem(${title}).delivery"

def catalog[R] { prog: => R / Catalog }: R =
  try { prog() } with Catalog {
    def price(title) = resume(getPriceFor(title))
    def delivery(title) = resume(getDeliveryFor(title))
  }
```
Now the user input:

```effekt
extern io def prompt(title: String): String = js"window.prompt(${title})"

def input[R] { prog: => R / Input }: R =
  try { prog() } with Input {
    def desiredBook() = resume(prompt("What is the book you want to buy?"))
    def availableBudget() = {
      with on[WrongFormat].panic;
      resume(toInt(prompt("How much money do you have?")))
    }
  }
```
Finally, our logging mechanism. Here we define two handlers `ignore` and `report`
to be able to choose whether we want to see the logs or not.
```effekt
def ignore[R] { prog: => R / Log }: R =
  try { prog() } with Log { def log(msg) = resume(()) }

def report[R] { prog: => R / Log }: R =
  try { prog() } with Log { def log(msg) = resume(println(msg)) }
```
## Running the Example
To run the example, we now need to plug everything together:
```effekt
def main() = eventloop(box {
  val buyer = Location[Unit](1, "buyer");
  val seller = Location[Unit](2, "seller");

  val channels: Channels = ref(Nil())
  val budget = 40

  val p1 = do promise(box {
    with network(channels);
    with catalog;
    with input;
    with report; // change to report to see traces

    epp([Exists(buyer), Exists(seller)], buyer) { bookseller(buyer, seller) }
    })

  val p2 = do promise(box {
    with network(channels);
    with catalog;
    with input;
    with report;

    epp([Exists(buyer), Exists(seller)], seller) { bookseller(buyer, seller) }
  })

  println("Result at buyer:" ++ genericShow(do await(p1)))
  println("Result at buyer:" ++ genericShow(do await(p2)))
})
```


```effekt:repl
main()
```
