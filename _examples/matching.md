---
title: Matching
date: 2024-02-05
---

# Pattern Matching

This example illustrates the new pattern matching capabilities of the language (discussed [here](https://github.com/effekt-lang/effekt/issues/383)).

In particular, we can now

- finally match on literals again
- have multiple guards (with `and`) that can also match again (with `is`, see below)
- `while` and `if` can both take guards
- `while`, `if`, and `match` all have `else` clauses.

```effekt:reset:hide:prelude
import list
import option
```
```
record Request(username: String)
record User(id: Int)
record Message(from: User, content: String)

def userName(id: Int): Option[String] = id match {
  case 42 => Some("john")
  case 24 => Some("peter")
  case 27 => Some("mary")
  case 29 => Some("margret")
  case _ => None()
}

def userFor(key: String): Option[User] = key match {
  case "john" => Some(User(42))
  case "peter" => Some(User(24))
  case "mary" => Some(User(27))
  case "margret" => Some(User(29))
  case _ => None()
}

def inbox(user: User): Option[List[Message]] = user match {
  case User(42) => Some([ Message(User(27), "hi, how are you doing?") ])
  case User(29) => Some([ Message(User(42), "I'll be joining you for a beer tonight! How about 8?") ])
  case _ => None()
}

def showInbox(req: Request) = req match {
  case Request(name) and userFor(name) is Some(user) and inbox(user) is Some(msgs) =>
    var toShow = msgs
    // this is just to show case
    while (toShow is Cons(Message(User(id), content), rest) and userName(id) is Some(from)) {
      println("From: @" ++ from)
      println("---")
      println(content)
      toShow = rest
    }
  case _ => println("No messages")
}

def main() = {
  ["peter", "mary", "john", "margret"].foreach { name =>

    println("\n\nInbox of: @" ++ name)
    showInbox(Request(name))
  }
}
```

```effekt:repl
main()
```
