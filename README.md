# 75 Hard Tracker

A customizable daily-challenge tracker inspired by the 75 Hard program. Check off your
daily tasks, watch your streak, and if you miss a task the challenge automatically
resets to Day 1 — just like the real thing.

## Features

- **Today view** — checklist of daily tasks, streak counter, progress bar
- **Customizable rules** — edit the daily task list and challenge length (defaults to
  the classic 75 Hard: diet, two workouts including one outdoors, a gallon of water,
  10 pages of reading, and a progress photo, over 75 days)
- **Auto-reset** — any day left incomplete before midnight resets the challenge back
  to Day 1, archiving the attempt to history
- **Progress view** — calendar grid of the whole challenge plus a log of past attempts
- **Local-only storage** — everything is saved in your browser (localStorage), no
  account or backend required

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
```
