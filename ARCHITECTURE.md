# City Simulator — Architecture

This branch evolves the existing My Clicker game into the city economic simulator.

## Stability rules
- Preserve the existing working game while adding features.
- Keep one authoritative Game State.
- Keep one Economy system as the only place that mutates money/income.
- Add systems incrementally instead of replacing the whole game.
- Do not rename existing public DOM ids, handlers, or working controls unless required.
- After each stage, verify menu, game entry, map rendering, camera, controls, building placement, economy, save/load, and console errors.

## Target systems
- GameManager — lifecycle and screen/state transitions.
- GameState — authoritative serializable game state.
- World — world-level orchestration.
- Map — terrain, lots, roads and city layout.
- Camera — pan, zoom and viewport limits.
- Buildings — building definitions, placement and upgrades.
- Roads — road geometry and road layer.
- Vehicles — traffic routes and vehicle simulation.
- Economy — income, expenses and transactions.
- Resources — player resources.
- Shop — purchasable goods/objects.
- Player — progression and player data.
- UI — HUD, tabs, panels and notifications.
- Settings — persistent settings.
- SaveLoad — versioned local persistence.

## Current baseline
The current production code is intentionally kept intact on main. The existing implementation is a single index.html with working city rendering, camera gestures, building placement, economy, tabs and local save.
Migration will be incremental. New systems will first be introduced without duplicating authoritative state; existing logic will then be moved behind those systems one subsystem at a time.

## Stage order
1. Architecture and startup
2. Main menu
3. Game map
4. Camera
5. Buildings and decoration
6. Roads
7. Vehicles
8. Economy
9. Shop
10. UI
11. Save/load
12. Settings
13. Optimization