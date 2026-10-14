# Project 0: What's inside a game controller?

A page made of clickable parts, built on the class template. Click a part of the controller and it
animates away from the object, a short explanation of it appears, and a language model can explain why the part matters.
A second page, part2.html, plays a second sprite sheet, "Used. Broken. Binned.".

Plain HTML, CSS and JavaScript. No framework and no build step.

## Run it

The page loads JSON files, so it must be served, not opened by double-clicking.

1. Open a terminal in this folder.
2. Run `python3 -m http.server 8000`.
3. Open <http://localhost:8000>.

To try the **Ask the model** button, install [Ollama](https://ollama.com/download), run
`ollama pull gemma3:1b` once, and keep Ollama running. (To use Claude or OpenAI instead, follow the
class README: set `PROVIDER` at the top of `script.js` and run `node server.js`.)

## What is in the folder

| File | What it does |
|---|---|
| `index.html` | Part 1: the object area, the fact card, and the link to Part 2 |
| `part2.html` | Part 2: the "Used. Broken. Binned." animation |
| `style.css` | The look, and the stepped transitions that play each sprite sheet |
| `script.js` | Part 1: loads the JSON, builds the object, handles clicks, calls the model |
| `story.js` | Part 2: the animation, one frame per press |
| `data/facts.json` | The six facts: which part, title, fact, source, link |
| `data/waste.json` | The words and numbers for Part 2 |
| `assets/*-sheet.png` | One sprite sheet per part: `shell`, `caps`, `frame`, `pcb`, `sticks`, `battery` (11 frames each) |
| `assets/decay-sheet.png` | The Part 2 sprite sheet (12 frames) |
| `assets/parts.json` | Where each part sits and where it can be clicked |

## How the parts were made

All artwork is my own pixel drawing. The exploded view was drawn as 11 whole-object frames. I split
it into six parts (top shell with its buttons, thumbstick caps, inner frame, main board, stick
modules, battery and motors). Each part has its own sheet in which it moves from its place in the
assembled controller to its place in the exploded view, so each can be clicked on its own.
