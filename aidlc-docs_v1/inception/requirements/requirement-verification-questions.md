# Requirements Verification Questions

Please answer the following questions to help clarify the requirements for the penalty shootout game.

## Question 1
How many penalty kicks should each side take in the shootout?

A) Standard 5 kicks per side (with sudden death if tied)
B) 3 kicks per side (shorter game, with sudden death if tied)
C) Unlimited — play until one side wins (pure sudden death from the start)
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
What visual perspective should the game use?

A) Behind the penalty taker (looking toward the goal) — classic FIFA 94 style
B) Side-on view (camera from the sideline)
C) Top-down bird's eye view
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
How should penalty taking work for the player?

A) Aim with arrow keys/mouse to choose direction, then press to shoot (power determined by timing)
B) Simple directional choice only (pick a corner, fixed power)
C) Power bar + direction (two-step: set power, then aim)
D) Other (please describe after [Answer]: tag below)

[Answer]: A. Arrows for direction, hold space for more power, show power bar. More power = less accuracy

## Question 4
How should goalkeeping work for the player?

A) Choose a direction to dive before the shot (left/center/right)
B) Choose from more positions (top-left, bottom-left, top-right, bottom-right, center)
C) Real-time reaction — dive after seeing the shot direction
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
Should the game have any of these extras? (Pick the most important one for MVP)

A) Just the core penalty shootout — no extras needed
B) Team selection (pick from a few national teams with different kits)
C) Score tracking / high score board
D) Simple crowd/atmosphere sounds
E) Other (please describe after [Answer]: tag below)

[Answer]: B. Use national teams participating in world cup 2026

## Question 6
What technology stack do you prefer for the browser game?

A) Vanilla HTML5 Canvas + JavaScript (simplest, no dependencies)
B) Phaser.js (popular 2D game framework)
C) PixiJS (fast 2D renderer)
D) Other (please describe after [Answer]: tag below)

[Answer]: D. Pick something that makes sense for a 4 hour workshop.

## Question 7: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 8: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
D) Other (please describe after [Answer]: tag below)

[Answer]: No tests at this stage
