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
- Use **Find a match** for a free hint.
- Use **Restart level** to try a new board.
- Keyboard: Tab to a tile, arrow keys to move focus, Enter or Space to select.

Tour stars, best scores, and an unfinished show save locally on this device. Storage failure falls back to the current session. No account, payments, tracking, or backend is required. Sound is off by default.

## Publish with GitHub Pages

In the repository's **Settings → Pages**, select **Deploy from a branch**, choose **main** and **/ (root)**, then save. GitHub will display the live address after deployment finishes.

## Project files

- `index.html`: game interface
- `style.css`: responsive layout and styling
- `game.js`: matching, power-ups, level progression, and sound
- `tour.js`: venue selection, briefings, rewards, unlocks, and local saves
- `concert-world.webp`: original generated concert island artwork used by the tour and play screen
- `concert.jpg`: optional original AI-generated concert background (not used by the current interface)
- `pieces/`: original vector stars, hearts, notes, beats, tickets, and gems

The interface uses six original SVG pieces with subtle gradients and optionally loads DM Sans from Google Fonts. System fonts are used if the fonts are unavailable. All artwork, copy, and audio are original or generic; the game does not include artist branding, licensed songs, or recognizable artist likenesses.

The browser WebMCP API is feature-detected. In supported browsers it exposes game-state reading and adjacent-tile swaps. Real-browser WebMCP validation has not been performed.

## Concert tour

Choose an unlocked venue, read its goal, and take the stage. Each completed venue unlocks the next. Completing the goal earns one star; finishing with at least 15% of starting moves earns two, and at least 40% earns three. Replays keep your best stars and score. The energy meter reflects collection progress. Returning to the tour pauses the show, and Resume restores the same board and remaining moves. No licensed songs or artist assets are used.
