# Architecture decision records

Each record covers one area of the site. A section names the code it governs on its `Where:` line, then gives the decision and its reason. When code moves, update the `Where:` line; when a decision no longer holds, delete its section.

| ADR                                   | Area                                              |
| ------------------------------------- | ------------------------------------------------- |
| [0001](0001-no-comments-in-code.md)   | The comment ban and its directive allowlist       |
| [0002](0002-state-and-persistence.md) | The store, what is saved and how it is restored   |
| [0003](0003-boot-and-modes.md)        | First paint, loading the town, Story/Explore/Text |
| [0004](0004-rendering-performance.md) | Tiers, the governor, shaders, shadows, draw calls |
| [0005](0005-camera-and-tour.md)       | The camera rig and the story tour's poses         |
| [0006](0006-town-content.md)          | What the town shows and how it moves              |
| [0007](0007-end-to-end-tests.md)      | How the Playwright suite drives the town          |
| [0008](0008-content-and-seo.md)       | Project copy, hosting data, structured data       |
| [0009](0009-hud-and-client-ui.md)     | The HUD, keys, dialogs, favicon and touch input   |
| [0010](0010-status-api.md)            | The service-status edge function                  |
| [0011](0011-build-and-tooling.md)     | Vite, bundle budgets, posters and test setup      |
