### 3. `constants.js.md`

```markdown
# constants.js (Configurations)

This file isolates all static maps, arrays, and lookup tables. By decoupling these from the main engine, we prevent circular dependencies and allow lightweight UI layers to access definitions without importing the heavy bitboard logic.

## Exports

* **`VARIANT_STARTING_FENS`**: A dictionary mapping all 15 variant identifiers to their exact starting FEN strings (including complex starting pockets or spell cooldowns).
* **`CHESS960_FENS`**: A pre-computed array of all 960 starting positions for Fischer Random chess.
* **`NAG_MAP`**: A mapping of Numeric Annotation Glyphs (e.g., `$1`, `$3`) to UI-friendly symbols (`!`, `!!`), CSS classes, and hex colors for frontend rendering.
* **`ISO_TO_COUNTRY_NAME`**: A lookup table translating 2-letter ISO country codes into full display names (used for player profiles).
* **`FILES` & `RANKS`**: Simple arrays representing the 8x8 grid coordinates.