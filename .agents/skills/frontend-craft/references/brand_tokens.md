# Brand Tokens — Reliance Digital Leaderboard

Complete reference for all CSS custom properties defined in `css/style.css :root {}`.
Always use these tokens. Never hardcode values.

---

## Color Tokens

### Blue Family (Primary Brand)
| Token             | Value     | Usage                                    |
|-------------------|-----------|------------------------------------------|
| `--blue`          | `#003087` | Primary CTAs, nav background, headings   |
| `--blue-mid`      | `#0052CC` | Hover state on blue elements             |
| `--blue-light`    | `#1A73E8` | Links, icon accents, secondary actions   |
| `--blue-pale`     | `#EEF4FF` | Tag fills, chip backgrounds, light tints |

### Red Family (Accent Brand)
| Token             | Value     | Usage                                      |
|-------------------|-----------|--------------------------------------------|
| `--red`           | `#E31837` | Rank badges, alerts, accent CTAs, eyebrows |
| `--red-dark`      | `#B5142C` | Hover state on red elements                |
| `--red-pale`      | `#FFF0F2` | Light red backgrounds, warning fills       |

### Backgrounds & Surfaces
| Token             | Value                     | Usage                              |
|-------------------|---------------------------|------------------------------------|
| `--bg`            | `#FFFFFF`                 | Page / card backgrounds            |
| `--bg2`           | `#F5F8FF`                 | Alternating section backgrounds    |
| `--bg3`           | `#EDF2FF`                 | Subtle chip / hover fills          |
| `--surface`       | `rgba(0,48,135,0.04)`     | Glass card fill (lightest)         |
| `--surface2`      | `rgba(0,48,135,0.07)`     | Glass card hover state             |
| `--surface3`      | `rgba(0,48,135,0.11)`     | Glass card active / selected       |

### Borders
| Token             | Value                     | Usage                              |
|-------------------|---------------------------|------------------------------------|
| `--border`        | `rgba(0,48,135,0.10)`     | Default card / input border        |
| `--border2`       | `rgba(0,48,135,0.25)`     | Hover / focus border               |
| `--border-red`    | `rgba(227,24,55,0.25)`    | Red-accented component borders     |

### Text
| Token             | Value     | Usage                                    |
|-------------------|-----------|------------------------------------------|
| `--text`          | `#1A1F36` | Primary body text (dark navy)            |
| `--text2`         | `#374878` | Secondary text, subtitles, labels        |
| `--text3`         | `#7A8BA8` | Tertiary, placeholders, helper text      |

### Ranking Colors
| Token             | Value     | Pair with      | Usage                  |
|-------------------|-----------|----------------|------------------------|
| `--gold`          | `#D4A800` | `--gold-bg`    | Rank #1 badge & row    |
| `--gold2`         | `#B8860B` | —              | Darker gold text       |
| `--gold-bg`       | `rgba(212,168,0,0.12)` | `--gold` | Rank #1 row fill  |
| `--silver`        | `#7A8BA8` | `--silver-bg`  | Rank #2 badge & row    |
| `--silver-bg`     | `rgba(122,139,168,0.12)` | `--silver` | Rank #2 row fill |
| `--bronze`        | `#A0522D` | `--bronze-bg`  | Rank #3 badge & row    |
| `--bronze-bg`     | `rgba(160,82,45,0.12)` | `--bronze` | Rank #3 row fill |
| `--green`         | `#00865A` | —              | Live indicator, success|

### Shadows
| Token             | Value                                    | Usage                 |
|-------------------|------------------------------------------|-----------------------|
| `--shadow`        | `0 4px 20px rgba(0,48,135,0.10)`         | Default card shadow   |
| `--shadow-blue`   | `0 8px 32px rgba(0,48,135,0.18)`         | Hover / elevated blue |
| `--shadow-red`    | `0 8px 32px rgba(227,24,55,0.14)`        | Hover / elevated red  |

### Radii
| Token             | Value  | Usage                                  |
|-------------------|--------|----------------------------------------|
| `--radius`        | `16px` | Standard cards, panels, dropdowns      |
| `--radius-sm`     | `10px` | Buttons, inputs, small chips           |
| `--radius-lg`     | `24px` | Modals, hero cards, large panels       |

### Transitions
| Token             | Value                                    | Usage                 |
|-------------------|------------------------------------------|-----------------------|
| `--transition`    | `all 0.3s cubic-bezier(0.4,0,0.2,1)`    | All hover / state changes |

---

## Typography Tokens

Fonts already loaded via Google Fonts in `css/style.css` — do NOT add new imports.

| Role         | Font           | Weight | Size                    |
|--------------|----------------|--------|-------------------------|
| Display      | Space Grotesk  | 800    | `clamp(52px,10vw,100px)`|
| H1           | Space Grotesk  | 700    | `clamp(32px,5vw,56px)`  |
| H2           | Space Grotesk  | 700    | `clamp(24px,4vw,40px)`  |
| H3           | Inter          | 600    | `20px`                  |
| Body         | Inter          | 400    | `15–16px`               |
| Caption/Label| Inter          | 600    | `11px` + letter-spacing |
| Stat/KPI     | Space Grotesk  | 800    | `clamp(28px,5vw,48px)`  |
| Code/Mono    | monospace      | 400    | `13px`                  |

---

## Gradient Recipes

```css
/* Brand gradient — strip bars, primary buttons */
linear-gradient(90deg, var(--blue) 0%, var(--red) 100%)

/* Gradient text — hero titles */
linear-gradient(135deg, var(--blue) 0%, var(--blue) 48%, var(--red) 52%, var(--red) 100%)

/* Blue depth — card headers, buttons */
linear-gradient(135deg, var(--blue) 0%, var(--blue-light) 100%)

/* Subtle card top-border accent */
linear-gradient(90deg, var(--blue), var(--red))  /* height: 3–4px */

/* Countdown / hero strip */
linear-gradient(90deg, var(--blue) 0%, #004AAD 40%, #9B0000 70%, var(--red) 100%)
```
