# Misinformation Matters — Static Experiment

## Files
- `index.html` — page structure
- `styles.css` — visual styling
- `script.js` — questions, game logic, scoring, and CSV exports

## Run locally
1. Keep all three files in the same folder.
2. Open `index.html` in a modern browser.
3. Complete the four pre-game questions, three game rounds, learning guide, and four post-game questions.
4. Download both CSV files from the results screen.

No server, database, React, Node, or build step is required. The Google Fonts import is optional; the page falls back to common system fonts if offline.

## Data exports
- `misinformation_session_summary.csv`: exactly one data row for the session.
- `misinformation_trial_level.csv`: one row for each answered pre-game, game, and post-game question. The `correct` and `correctness` columns score each response.

## Experimental note
The celebrity and event are fictional. The event visual is a CSS-designed illustration labeled as simulated AI imagery, not an actual photo or a claim about a real celebrity. This avoids spreading a false claim about a real person while preserving the misinformation-literacy task.
