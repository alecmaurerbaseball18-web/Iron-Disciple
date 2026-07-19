# v3.0.0-alpha.3 verification

Completed checks:

- JavaScript syntax validation for `storage.js`, `migration-engine.js`, and `app.js`.
- In-memory smoke test covering JSON reads/writes, raw reads/writes, key enumeration, removal, and existence checks.
- Repository scan confirms direct `localStorage` access is isolated to the storage service.
- Script order confirms `storage.js` loads before migration and application startup.
- Service worker cache includes `storage.js` and uses a new cache version.

Manual browser checks recommended after deployment:

1. Open the app and verify existing saved mission data remains present.
2. Complete and reopen a workout entry.
3. Change settings and reload the app.
4. Export a backup, then verify the file downloads.
5. Test Reset Today Only.


### Alpha 5 workout checks
1. Generate a mission containing a workout.
2. Open every Start Exercise button.
3. Log sets, RPE, technique, pain, and notes.
4. Save and reopen an exercise.
5. Verify the rest timer completes and the workout remains after reload.

## v3.0.0-alpha.6 Recovery checks
1. Leave all morning readiness inputs at zero and confirm readiness remains GREEN / 100.
2. Enter sleep below 5 hours and confirm the sleep trigger appears and readiness declines.
3. Enter shoulder pain 6 or higher and confirm readiness becomes RED and throwing changes to STOP.
4. Enter shoulder pain 3–5 or arm fatigue 6+ and confirm throwing changes to REDUCED.
5. Add hydration and confirm the total/progress persist after reopening the app.


## v3.0.0-alpha.7 Command Center checks

1. Open the Command Center and confirm all score cards, alerts, status, shift, weight, and next-event fields render.
2. Use every Command Center action button and confirm it opens the correct tab.
3. Update hydration, save a day, or complete a workout and confirm the Command Center refreshes.
4. In the console, verify `AppState.get("command.summary")` returns the current summary.
5. Confirm the app still loads offline after one successful online load.


## Alpha 8 nutrition checks
1. Open Nutrition and verify recommendation, weight trend, compliance, calories, protein, hydration, meal plan, safeguards, and chart render.
2. Save a nutrition log and reload; verify the same data persists.
3. Verify Morning Briefing hydration target matches Nutrition.
4. Test offline reload after one successful online load.

## Alpha 9 checks
- Confirm the Professional Dashboard renders on initial load.
- Toggle a timeline item and reload; the completion state must persist.
- Use Complete Next Task and verify progress, next task, Morning Briefing, Adaptive Mission, and Command Center refresh.
- Reset the timeline and confirm only timeline checkmarks are cleared.


## Alpha 10 mission checks
1. Generate or refresh today's mission.
2. Confirm the Adaptive Mission card displays its risk, headline, first action, task count, and deferred count.
3. Change sleep, stress, soreness, or shoulder pain and confirm the adaptive plan changes.
4. Complete a professional timeline item and confirm the adaptive mission refreshes.
5. Confirm deferred strength, golf, or softball tasks persist in today's `adaptiveCarryover`.
6. Reload the PWA and confirm the Mission module is available offline.


## Alpha 11 shift checks
1. Confirm current shift title, wake time, sleep window, and training limit.
2. Confirm timeline, meal timing, rules, and 14-day preview render.
3. Change a schedule entry and verify Mission, Morning Briefing, Nutrition, and Professional Dashboard use it.
4. Confirm `AppState.get("shift.current")` contains the current summary.
5. Reload offline and verify the Shift module loads.


## Alpha 12 intelligence checks
1. Confirm `window.IronIntelligence` exists.
2. Confirm `AppState.get("intelligence.summary")` returns a status and score.
3. Verify recommendations respond to readiness, shoulder pain, hydration, shift, and active workout state.
4. Confirm high-priority recommendations sort first.
5. Reload offline and confirm the three Intelligence files are cached.


## Alpha 13 one-tap operations checks
1. Open the app and confirm One Tap is the default screen.
2. Add one entry in each operational section.
3. Mark a task and report complete and confirm counts update.
4. Confirm the automatic pass-down contains all entered information.
5. Tap Copy Pass-Down and paste the result into another app.
6. Reload and confirm entries persist.
7. Reload offline and confirm the Operations Hub loads.


## 4.0.0-alpha.5 true-flat checks
1. Open the ZIP and verify every file is visible immediately.
2. Confirm the ZIP contains zero directories.
3. Load `index.html` and verify the One-Tap screen opens.
4. Verify operations, readiness, workout, nutrition, mission, shift, command, and intelligence runtimes load.
5. Verify offline reload after the initial successful load.


## 4.0.0-alpha.5 projects checks
1. Open Projects from the top navigation.
2. Add a project with a category, status, priority, due date, next action, and notes.
3. Edit the project and confirm changes persist.
4. Cycle the status button through planned, active, blocked, and complete.
5. Filter the board by status.
6. Reload and verify projects persist.
7. Reload offline and verify the Projects Hub loads.


## 4.0.0-alpha.5 daily checks
1. Open Today from the top navigation.
2. Enter three priorities and reload to verify persistence.
3. Toggle all shift and performance checklist items.
4. Enter scripture, prayer, gratitude, notes, and wins.
5. Mark faith complete and verify the progress bar updates.
6. Use Next Project Action and verify the project appears in an open priority slot.
7. Reset today and confirm all daily fields clear.
8. Reload offline and verify the Daily Command Center loads.

## 4.0.0-alpha.5 dashboard checks
1. Confirm Dashboard opens first.
2. Verify mission priorities reflect Today.
3. Verify project card shows the next active project action.
4. Verify operational counts update.
5. Verify card buttons open the correct section.
6. Verify offline reload.
