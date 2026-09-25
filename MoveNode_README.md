# MoveNode.js (Tree Data Structure)

Defines the `MoveNode` class, the foundational building block for PGN game trees and analysis variants. 

## ⚡ Performance Optimizations
* **Zero-Allocation FEN Parsing:** Extracts `turnColor` and `moveNumber` directly via `indexOf` and `charCodeAt` rather than using expensive `fen.split(' ')` operations.
* **Base36 ID Generation:** Replaces slow UUID generation with an ultra-fast static sequential counter (`n_1`, `n_2`, `n_3a`), ensuring DOM rendering and node lookups are instantaneous.

## Key Properties
* `id`: Unique identifier for DOM mapping.
* `fen`: The exact board state at this node.
* `moveSan`: The SAN string of the move played to reach this node.
* `parent`: Reference to the parent `MoveNode`.
* `children`: Array of child `MoveNode` objects (supporting infinite variation branches).
* `isPV`: Boolean flag locking nodes that belong to an Engine's Principal Variation line (prevents mainline overwrite).
* **Telemetry Data:** Natively stores `evalScore`, `depth`, `nps`, `timeSpent`, `arrows`, and `circles`.