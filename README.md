# Purple Encore

An original purple concert-themed match-three browser game with five levels, row-clearing Encore tiles, color-clearing Spotlight tiles, hints, and optional synthesized sound.

## Play locally

Open `index.html` in your browser, or serve this folder:

```sh
python3 -m http.server 4173
```

Then open http://localhost:4173.

## How to play

Select a tile, then an adjacent tile to swap. Match three or more identical tiles to collect them. Invalid swaps cost no move. Meet the collection goal before running out of moves.

- Match four to create an Encore tile. Matching it clears its row.
- Match five to create a Spotlight tile. Swap it with a neighbor to clear that neighbor's color.
- Use **Show a match** for a free hint.
- Use **Restart level** to try a new board.
- Keyboard: Tab to a tile, arrow keys to move focus, Enter or Space to select.

Progress lasts for the current play session. No account, payments, tracking, or backend is required. Sound is off by default.

## Publish with GitHub Pages

In the repository's **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/ (root)**, then save. GitHub will display the live address after deployment finishes.

## Project files

- `index.html`: game interface
- `style.css`: responsive layout and styling
- `game.js`: matching, power-ups, level progression, and sound
- `concert.jpg`: original AI-generated concert background

The interface uses platform emoji and optionally loads DM Sans and Outfit from Google Fonts. System fonts are used if the fonts are unavailable. All artwork, copy, and audio are original or generic; the game does not include artist branding, licensed songs, or recognizable artist likenesses.

The browser WebMCP API is feature-detected. In supported browsers it exposes game-state reading and adjacent-tile swaps. Real-browser WebMCP validation has not been performed.
