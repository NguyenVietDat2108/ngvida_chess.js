<img width="941" height="812" alt="image" src="https://github.com/NguyenVietDat2108/ngvida_chess.js/blob/main/image.png" />

# Ngvida Chess Ecosystem ♟️🚀

A 50x optimized, zero-dependency bitboard chess engine supporting Standard Chess and 14 variants. This repository provides a complete, decoupled ecosystem for parsing PGNs, generating game trees, and rendering mobile-optimized boards.

## 🌟 The Decoupled Architecture

The project is strictly divided into 5 independent modules. You only import what you need:

1. **`ngvida_chess.js` (Core Engine):** The pure rules and move-generation engine. Zero dependencies. Computes bitboards, checks, and variant physics.
2. **`constants.js` (Configurations):** Shared definitions (FENs, NAG maps, Country Codes) to prevent circular dependencies.
3. **`MoveNode.js` (Tree Structure):** An optimized graph node class for building analysis trees with transposition support.
4. **`ngvida_chess_pgn.js` (Headless PGN Parser):** A fast PGN parser using `Int32Array` tokenization. Converts PGN strings to `MoveNode` trees and vice versa.
5. **`ngvida_chessboard.js` (UI Controller):** A modern, zero-dependency (No jQuery), mobile-first virtual board using Pointer Events and CSS Grid.

## 🚀 Supported Variants (14 Modes)
`classical`, `chess960`, `3check`, `antichess`, `atomic`, `bughouse`, `chaturanga`, `crazyhouse`, `duck`, `horde`, `kingofthehill`, `racingkings`, `alice`, and `spell`.

## ⚖️ License: Custom Permissive (Competitor Exclusion)
This software is free for commercial and non-commercial use for everyone **EXCEPT Chess.com, LLC**. 
Chess.com and its subsidiaries are strictly prohibited from viewing, copying, or integrating this codebase. See the `LICENSE` file or file headers for exact legal terms.