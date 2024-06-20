---
layout: docs
title: Foreign Function Interface
permalink: docs/concepts/ffi
---
# Foreign Function Interface
Effekt implements a Foreign Function Interface (FFI) for the host languages JavaScript and Java. With Effekt’s FFI it is possible to use the host language functions, to model hosts objects, and to use their methods. The FFI differentiates between value types, which do not have to be tracked by Effekt for any changes, and are opaque (Effekt does not understand the semantics of the FFI types), and interface types that describe objects that need to be tracked by Effekt, and can be used to model FFI capabilities. To track any interfaces, one has to define resources which should be tracked by Effekt and let the object live in these resources.

## Using external functions with value types:
Let's assume we want to use JavaScript's `Math.random` function in Effekt.
```effekt
extern io def random(): Double = "Math.random()"
```
The defintion of an external function is indicated by the keyword `extern` followed by `io`. `io` tells the compiler, that the external function uses the `io` resource, which is tracked by Effekt. The Effekt compiler can not check to typesafety, so the return type annotation needs to ensured by the programmer.

## Interfaces and resources
Interfaces can be used to model external objects. These objects need to be tracked by Effekt with a resource. 
```effekt
extern interface Array
extern resource stack: Array
extern {stack} def makeArray(size: Int): Array at {stack} = "size"
```
The definition of an external function is indicated by the keyword `extern` followed by `io`. `io` tells the compiler, that the external function uses the `io` resource, which is tracked by Effekt. The Effekt compiler can not check for type safety, so the return type annotation needs to be ensured by the programmer.