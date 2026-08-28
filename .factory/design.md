# Nutrient Floor design thesis

## Direction: blueprint drafting sheet

Nutrient Floor is a planning instrument, not a food diary. The interface takes
its cues from a cook's marked-up prep sheet: deep blueprint blue, warm paper
labels, measurement ticks, thin ruled lines, and high-contrast pencil-like
figures. The visual language makes a small weekly menu feel inspectable rather
than judged. It deliberately avoids calorie-app gloss, health imagery, and
generic dashboard cards.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#071f36` | dark-mode background / headings |
| `--blue` | `#0b3d66` | blueprint field |
| `--paper` | `#f6f0df` | light-mode background / labels |
| `--paper-deep` | `#e7dcc3` | secondary surface |
| `--graphite` | `#10283a` | body copy on paper |
| `--chalk` | `#f8f4e8` | copy on blue |
| `--lime` | `#c7eb6e` | met floor / main action |
| `--coral` | `#cf5b49` | over-limit / delete warning |
| `--rule` | `#7aa1b8` | drafting rules |

The default is light paper with a dark-blue planning board. Dark mode swaps the
outer paper for `--ink` and keeps the board readable. All text choices meet
4.5:1 contrast against their backgrounds.

## Type, space, and shape

`Georgia` supplies the human, recipe-note voice in headings. The self-host-free
system `ui-monospace` stack gives values, table columns, and controls the
precision of a blueprint. Space follows a 4 / 8 / 12 / 16 / 24 / 32 / 48 scale.
Corners are mostly square (2px), with clipped-corner tabs for selected views.
Lines and tick marks group information before panels do.

## Interaction and motion

Changing a portion redraws its measuring bar in 180ms; saving a meal briefly
stamps its date. The weekly board is the visual centre and takes priority on
phones. `prefers-reduced-motion: reduce` removes all transitions and transforms.
Focus uses a thick lime-and-blue outline.

## Original art plan and provenance

The hero art is an original generated editorial still life: a top-down drafting
sheet where coloured food ingredients become plotted nutrition shapes. It is
only atmosphere; no critical information appears in it. Prompt sheet:

> Use case: stylized-concept. Asset type: Nutrient Floor hero and social card.
> Primary request: top-down editorial illustration of a cook's blue cyanotype
> drafting sheet with hand-drawn grid lines, lentils, a sliced chickpea bowl,
> oats, tofu, spinach and a lemon arranged as measurement marks and simple
> geometric nutrition charts. Materials: matte paper, blueprint ink, graphite,
> chalk, warm cream labels. Lighting: soft overhead studio light. Palette:
> navy blueprint, cream paper, lime yellow-green, muted coral. No people,
> no brand marks, no readable text, no logos, no watermark.

Generated with the factory Azure image deployment on 2026-08-28. It will be
optimised to WebP and used with meaningful alt text. All remaining graphics are
hand-authored SVG/CSS drafting marks.
