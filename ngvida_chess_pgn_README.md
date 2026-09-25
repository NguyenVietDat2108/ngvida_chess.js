# ngvida_chess_pgn.js (Headless PGN Parser)

A blazing-fast, DOM-independent parser that converts raw PGN strings into a navigable `MoveNode` tree, and serializes trees back into PGN strings. 

## ⚡ Technical Highlights
* **Int32Array Tokenization:** Instead of slow Regex or string splitting, it parses PGN using a single-pass character scan (`charCodeAt`), storing token boundaries in memory-efficient typed arrays.
* **Smart PV Transpositions:** Detects identical board states (FENs) in engine analysis lines and links them via a Directed Acyclic Graph (DAG) approach, drastically reducing memory bloat.

## API

### `NgvidaPGN.parsePGN(pgnString, defaultVariant, CustomEngineClass)`
Converts a PGN string into a game tree.
* Auto-detects the variant from the `[Variant "xxx"]` header.
* Isolates engine telemetry (`[%eval]`, `[%clk]`, `tl=`, `nps=`) and attaches it directly to the generated `MoveNode` objects.
* **Returns:** `{ rootNode, headers, gameMode }`

### `NgvidaPGN.generatePGN(rootNode, headers)`
Traverses the tree to generate a perfectly formatted PGN string.
* Automatically formats recursive variations `(...)`.
* Injects Lichess-compatible extensions (`[%eval]`, `[%cal]`, `[%csl]`).