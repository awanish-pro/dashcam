# Airawat Interface Design System

The interface kit for Airawat's municipal platforms: **PGR** (Public Grievance Redressal), **VMS** (Video Management System) and **Property Tax**. It applies the *Airawat Design and Brand Guide, Version 2 (16 October 2026)* to screen-based software.

When this document and the brand guide disagree, the brand guide wins. When the brand guide is silent on an interface need, this document records the smallest extension that keeps to its intent. Those extensions are marked **UI extension**.

---

## Contents

1. [Principles](#1-principles)
2. [Voice and writing](#2-voice-and-writing)
3. [Getting started](#3-getting-started)
4. [Colour](#4-colour)
5. [Gradients](#5-gradients)
6. [Typography](#6-typography)
7. [Iconography and motifs](#7-iconography-and-motifs)
8. [Effects and elevation](#8-effects-and-elevation)
9. [Spacing, radius and grid](#9-spacing-radius-and-grid)
10. [Theming: paper and ink](#10-theming-paper-and-ink)
11. [Base components](#11-base-components)
12. [Application components](#12-application-components)
13. [Product conventions](#13-product-conventions)
14. [Accessibility](#14-accessibility)
15. [Extending the system](#15-extending-the-system)
16. [Checklist before release](#16-checklist-before-release)

---

## 1. Principles

**Evidence first, then the system, then the street.** Every screen moves an officer from a fact to a decision the city can stand behind.

| Principle | In practice |
| --- | --- |
| Tech-first, quiet, precise | Paper grounds, ink text, one accent. No decoration that carries no meaning. |
| Square by default | Every corner is square. Pills belong only to stage tags and circles only to people. |
| Words before colour | Status, stage and module always show a word. Colour reinforces it and never replaces it. |
| Depth without shadows | Layers separate by border weight, surface step and approved gradients. |
| Every number has a source | Metrics carry a source line. Estimates say so. |
| Readable for every reader | Many users are over 50 and work in the field. Use generous sizes, high contrast and plain language. |

---

## 2. Voice and writing

Write the way a senior engineer briefs a decision-maker: plain, specific and argument-forward.

- **Lead with the claim, then the evidence.** Write "38 grievances will breach SLA in 6 hours", not "Some items need attention".
- **Be precise.** Name the measure, the place and the number.
- **No em dashes.** Use a full stop, a comma or a colon. Split any sentence over 30 words.
- **Spell out acronyms on first use**, with the short form in brackets: "Service level agreement (SLA)". Use tooltips to define terms in dense views.
- **Not salesy.** Avoid "seamless", "revolutionary" and "world-class". No exclamation marks, no emoji.
- **Claim only what is measured.** Keep installed, measured, associated and planned apart.
- **Headlines close on an accent.** The last two to four words take `text-accent`, with one accent per headline. Use sentence case and end with a full stop.
- **Buttons are verbs** that name the result: "Assign grievance", "Close with proof", "Disable camera". Avoid "OK" and "Submit".
- **Dates** read `DD Mon YYYY` (`14 Jun 2026`). Never use ambiguous numerals.
- **Errors** say what failed in the reader's terms, give a reference code, and say what to do next.

Approved lines: *Research and innovation that start in a lab and end on our streets.* · *Technology for India, made in India.* · *Better data. Better decisions. Better cities.*

---

## 3. Getting started

### Stack

React 19, Vite 8, Tailwind CSS v4 (via `@tailwindcss/vite`) and TypeScript.

### Files

```
src/
  index.css          Tokens (@theme), theme-ink, type styles, gradients, effects
  ds/                Component library, exported from src/ds/index.ts
  showcase/          Living documentation (Foundation, Base, Application)
  App.tsx            Showcase shell
```

### Import

```tsx
import { Button, Display, Badge, ToastProvider } from '@/ds'
```

Wrap the app once in `<ToastProvider>` if you use `useToast()`.

### Fonts

Loaded from Google Fonts at the top of `src/index.css`: Space Grotesk 500 and 600, Inter 400 to 600, JetBrains Mono 400 and 500, Montserrat 700.

### Rules for consumers

- Use the components and token utilities. Do not write hex values, arbitrary colours or shadows in product code.
- Tailwind's default palette, radii and shadows are **removed** in `@theme`. Only brand tokens exist, so `bg-blue-500`, `rounded-lg` and `shadow-md` do nothing by design.

---

## 4. Colour

### Core palette

Five colours. Everything else is a tint, a deep step or a gradient stop of these.

| Token | Hex | Role |
| --- | --- | --- |
| `paper` | `#F5F3EC` | Warm paper. About 70% of every surface. |
| `ink` | `#111111` | Text, rules, primary actions. |
| `slate` | `#52769A` | Primary brand colour. |
| `rose` | `#9A5B6A` | Second brand colour (oxide rose). |
| `sage` | `#96A394` | Third brand colour. |

### Families

| Slate | Rose | Sage |
| --- | --- | --- |
| `slate-deep` `#2F4E6D` | `rose-deep` `#7E4554` | `sage-dark` `#4F5D50` |
| `slate` `#52769A` | `rose` `#9A5B6A` | `sage-deep` `#6F7E70` |
| `slate-light` `#9BB3CC` | `rose-light` `#C99AA2` | `sage` `#96A394` |
| `slate-wash` `#D1D8DA` | `rose-wash` `#E1D2CF` | `sage-wash` `#E0E1D9` |
| `slate-tint` `#E1E4E2` | `rose-tint` `#EAE1DC` | `sage-tint` `#EAE9E1` |

Washes and tints are **solid mixes with paper** (about 22% and 12%), never alpha. They are a **UI extension** for backgrounds of status and selection.

**Small text on paper never uses `slate`, `rose` or `sage`.** Use `slate-deep`, `rose-deep` or `sage-dark`.

### Ratio: 70 / 20 / 10

About 70% paper, 20% dark grounds (always a gradient that starts at ink), and 10% accent (slate, rose, sage).

### Semantic tokens

Use semantic tokens in components. They switch automatically inside `theme-ink` (see [section 10](#10-theming-paper-and-ink)).

| Token | Paper | Ink | Use |
| --- | --- | --- | --- |
| `surface` | `#F5F3EC` | `#111111` | Page ground |
| `surface-raised` | `#EFEAE1` | `#1C2A38` | Panels, header strips, sidebars |
| `surface-sunken` | `#EAE3D7` | `#0B0F14` | Disabled fields, empty tracks |
| `text` | `#111111` | `#F5F3EC` | Body and headlines (17.1:1) |
| `text-muted` | `#615A52` | `#C9D6E3` | Secondary text, captions (6.1:1) |
| `text-label` | `#2F4E6D` | `#9BB3CC` | Mono labels, section tags (7.8:1) |
| `text-accent` | `#7E4554` | `#C99AA2` | Headline accent words (6.6:1) |
| `rule` | `#111111` | `#4A5D72` | Running-head rules, table heads, overlay borders |
| `border` | `#D6CFC3` | `#4A5D72` | Card and box borders, dividers |
| `border-strong` | `#A99F91` | `#7E9BB8` | Form control borders (UI extension) |
| `focus` | `#2F4E6D` | `#C9D6E3` | Focus ring |
| `action` / `on-action` | ink / paper | paper / ink | Primary button, selected states |
| `brand` / `on-brand` | slate-deep / paper | slate-light / ink | Checked controls, slider fill, brand button |
| `hover` | `#EAE3D7` | `#2A3D51` | Hover fill |
| `selected` | `#E1E4E2` | `#2A3D51` | Range selection, selected rows |
| `figure` | slate | paper | Outlined figure stroke |
| `scrim` | ink at 72% | ink at 72% | Modal backdrop. **Screen only.** |

### Stage colours

The word is always shown with the colour.

| Stage | Paper | Ink |
| --- | --- | --- |
| Live | `stage-live` slate-deep | slate-light |
| Pilot | `stage-pilot` rose-deep | rose-light |
| Prototype | `stage-prototype` sage-dark | paper |

### Status tones (UI extension)

The palette has no red, amber or green, so status maps onto the five colours. Each tone is separated by **word and fill weight**, not hue alone.

| Tone | Word | Foreground | Tint | Use |
| --- | --- | --- | --- | --- |
| `info` | Notice | slate-deep | slate-tint | Assignments, system information |
| `success` | Resolved | sage-dark | sage-tint | Closed with proof, paid, online |
| `caution` | Caution | rose | rose-tint | SLA at risk, dues pending |
| `critical` | Critical | rose-deep (solid fill) | rose-wash | Breach, offline, failure |

### Chart series

Slate first, then rose, then sage. Bars are flat and square-ended, with no 3D effects or shadows.

---

## 5. Gradients

These are the only gradients. Each is linear at 145° (within the brand's 115° to 165° range), with the darker end at the top left. Do not invent new stops; add a gradient here first if a new use needs one.

| Utility | Stops | Use |
| --- | --- | --- |
| `bg-grad-paper` | `#F8F6EF` → `#EAE3D7` | Quiet light pages, panels |
| `bg-grad-ink` | `#111111` → `#2A2A2A` | Under photographs, toasts, banners |
| `bg-grad-slate` | slate-deep → `#7E9BB8` | Product and platform pages |
| `bg-grad-rose` | rose-deep → `#C48A96` | People, history |
| `bg-grad-sage` | sage-deep → `#B8C3B9` | Case studies, environment |
| `bg-grad-paper-slate` | paper → slate | Light hero (PGR, VMS) |
| `bg-grad-paper-rose` | paper → rose | Light hero |
| `bg-grad-paper-sage` | paper → sage | Light hero |
| `bg-grad-ink-slate` | ink → slate | Covers, section openers, dark specimens |
| `bg-grad-layered-slate` / `-rose` / `-sage` | `#F8F6EF` → mid → ink | Editorial dividers |
| `bg-grad-slate-rose` | slate → rose | Vision and closing |
| `bg-grad-partner` | slate-deep → `#3A5A7B` → `#5F5F7B` | Researcher and partner cards |
| `bg-grad-blueprint` | ink → `#1F3044` → slate-deep | Panels holding a diagram |
| `bg-blueprint-grid` | Blueprint gradient with a 12px and 60px grid | System diagrams |

Rules:

- Text on light gradients is `text` and must keep 4.5:1. Text on dark gradients is `paper` (apply `theme-ink`).
- Never use a flat charcoal page. A dark ground is always a gradient.
- Add `grain` for fine texture on large gradient grounds.
- Never lay a flat gradient over a photograph.

---

## 6. Typography

Four typefaces, each with one job.

| Face | Token | Job |
| --- | --- | --- |
| Space Grotesk | `font-display` | Headlines, figures, card titles. 500 for words, 600 for figures. Tight tracking. |
| Inter | `font-body` | All running text, controls, table cells. |
| JetBrains Mono | `font-mono` | Uppercase labels, codes, captions, keyboard hints. **Never sentences.** |
| Montserrat | `font-logo` | Only in product lockups beside the logo (`AIRAWAT OS`). **Never headlines.** |

### Type styles

Each style is a single utility that sets family, size, line height, weight and tracking.

| Utility | Size / line height / weight | Use |
| --- | --- | --- |
| `type-display-xl` | 46 / 1.04 / 500 | Section openers, covers. One per page. |
| `type-display-l` | 34 / 1.07 / 500 | Page headlines |
| `type-display-m` | 22 / 1.2 / 500 | Modal titles, state headlines, pull lines |
| `type-heading` | 16 / 1.25 / 500 | Card, box and alert headings |
| `type-figure-xl` | 56 / 0.88 / 600, +0.04em | Headline figures |
| `type-figure-m` | 30 / 1 / 600, +0.04em | Figure rows, timelines |
| `type-lead` | 17 / 1.6 / 400 | The paragraph under a headline |
| `type-body` | 15 / 1.6 / 400 | Running text, field values |
| `type-body-s` | 13 / 1.55 / 400 | Controls, card text, table cells |
| `type-label` | 11 / 1.4 / 500, caps, +0.08em | Section tags, field labels, header strips |
| `type-caption` | 11 / 1.5 / 400, caps, +0.04em | Sources, timestamps, footnotes |
| `type-wordmark` | 30 / 1 / 700 | Product lockup only |

**Outlined figures:** `figure-outline` gives a transparent fill and a 1.5px stroke in `figure` (slate on paper, paper on ink). Override per case with the CSS variable `--figure-stroke`.

Rules:

- Headlines are in sentence case, end with a full stop, and use balanced line breaks (`text-wrap: balance` is built in).
- Floors: body 14px in print and 13px in dense interface cells. Labels and captions never go below 11px.
- Keep uppercase to short mono tags. Keep prose near 65 characters (`max-w-prose`).

### Typography components

```tsx
<Display size="l" accent="matched to the ground.">Property records</Display>
<Text size="lead" muted>Complaints closed within 48 hours rose from 60% to 82%.</Text>
<Label>04 · PGR · Escalated</Label>
<Caption>Source: PGR ledger, Kanpur, May 2026</Caption>
<Figure size="xl">₹4.40 Cr</Figure>
<RunningHead left="05 · Platform" right="AirawatOS" />
```

`Display` sizes are `xl | l | m | heading`. `Text` sizes are `lead | body | body-s`. Passing a text colour class (for example `text-paper`) replaces the component's default colour.

---

## 7. Iconography and motifs

### No icon set

Meaning is carried by **words**, **mono labels** and **6px filled squares** (`<Square />` or `size-1.5 bg-slate`) in a stage or module colour.

### Functional glyphs (UI extension)

Interfaces need a few affordance marks, so `<Glyph name="…" />` provides 14 marks drawn as 1.5px square-capped strokes on a 16px grid:

`chevron-down` `chevron-up` `chevron-left` `chevron-right` `check` `minus` `plus` `close` `arrow-left` `arrow-right` `search` `more` `calendar` `download`

- Use them for affordance only: open, close, confirm, move.
- Never use them decoratively, and never as the only label. Icon-only buttons need an `aria-label` (the `IconButton` `label` prop).
- Never use emoji or a generic pictogram library.

### Heritage motifs

There are five hairline motifs (0.75px), plus a coloured Baoli variant. Use **one per screen**, in open space, never behind running text. Use slate, rose or sage on paper, or a lighter tint of the ground on dark.

| Component | Motif | Use in the interface |
| --- | --- | --- |
| `VastuMotif` | 9 × 9 pada grid | Empty states, onboarding, contents |
| `KolamMotif` | Line looped around dots | Network and connection, offline state, bands |
| `JaaliMotif` | Pierced stone screen | Ways of seeing: VMS surfaces |
| `BaoliMotif` (`coloured`) | Stepwell in section | Layered reading, drill-down, errors |
| `StambhaMotif` | Temple pillar | Platform, roadmap, team |

### Logos

Use supplied artwork only. Never redraw, recolour or re-letter it. Until the artwork is dropped in, `<LogoSlot />` marks its place. Use `logo-black` on paper and `logo-white` on dark gradients.

---

## 8. Effects and elevation

**There are no drop shadows, glows or blur.** Tailwind's shadow tokens are removed.

| Level | Treatment | Use |
| --- | --- | --- |
| 0 · Surface | `bg-surface` + `border-border` | Page, rows, cards |
| 1 · Raised | `bg-surface-raised` + `border-border` | Panels, header strips, sidebars |
| 2 · Overlay | `bg-surface` + `border-rule` | Menus, selects, date pickers, popovers |
| 3 · Modal | `bg-surface` + `border-rule` over `bg-scrim` | Dialogs, command menu |

| Effect | Utility | Notes |
| --- | --- | --- |
| Focus ring | `focus-ring` or global `:focus-visible` | 2px `focus` colour, 2px offset. Never remove it. |
| Grain | `grain` | Fine noise on gradient grounds |
| Blueprint grid | `bg-blueprint-grid` | Minor grid 12px, major grid 60px |
| Skeleton shimmer | `skeleton` | Solid tints, slow 1.6s sweep |
| Outlined figure | `figure-outline` | 1.5px stroke |

Rules:

- Cards carry a 1px border. Do not use coloured left-border accents on cards.
- The scrim and any translucency are **screen only**. Print files mix every colour to a solid value.
- Motion is short (150 to 300ms), linear or ease, and respects `prefers-reduced-motion`.

---

## 9. Spacing, radius and grid

### Spacing

Spacing uses a 4px base through Tailwind's spacing scale (`p-4` = 16px).

| Step | px | Typical use |
| --- | --- | --- |
| 1 | 4 | Icon to text gap, segmented gaps |
| 2 | 8 | Tight stacks, tag gaps |
| 3 | 12 | Control padding, list rows |
| 4 | 16 | Card padding (compact), field gaps |
| 6 | 24 | Card padding, grid gutters |
| 8 | 32 | Page margins, panel padding |
| 12 | 48 | Page margins (desktop) |
| 14 to 16 | 56 to 64 | Section spacing |

### Control heights

| Size | Height | Use |
| --- | --- | --- |
| sm | 32px (`h-8`) | Toolbars, table actions |
| md | 40px (`h-10`) | Default buttons and fields |
| lg | 48px (`h-12`) | Primary call to action, field devices |

Header strips are 24 to 32px tall.

### Radius

| Token | Utility | Only for |
| --- | --- | --- |
| `radius-0` | default (no class) | Everything |
| `radius-pill` | `rounded-pill` | Stage tags |
| `radius-round` | `rounded-round` | People photos and avatars |

Radios and switches stay square (**UI extension**), so the circle remains reserved for people.

### Grids

| Grid | Spec |
| --- | --- |
| Application | 12 columns, 24px gutters, 32 to 48px margins. Sidebar 240 to 264px. Content max 1200px. Prose max 65ch. |
| A4 document | 794 × 1123 at 96 dpi. Running head over a 1px rule; footer with airawat.org, page number and logo. |
| Blueprint | 12px minor and 60px major grid. Boxes have a 20px header strip with a name and a reference code (`SYS00`). The core element fills `slate-light`. |

Breakpoints follow Tailwind defaults. The side navigation collapses below `lg` (1024px) in the showcase and below 768px in product shells.

---

## 10. Theming: paper and ink

The paper theme is the default. Add the `theme-ink` utility to any dark gradient ground, and every semantic token inside it switches to its ink value, so components adapt with no extra props.

```tsx
<section className="theme-ink grain bg-grad-ink-slate p-8">
  <Display size="l" accent="built to scale.">One spine,</Display>
  <Button>Open live wall</Button>   {/* paper fill, ink text */}
  <StageTag stage="pilot" />        {/* rose-light */}
</section>
```

Rule: if a ground is dark, it must be an approved gradient **and** carry `theme-ink`.

---

## 11. Base components

All components are exported from `@/ds`.

### Avatar

People are the only circles. Photos are greyscale with a 2px paper ring. With no photo, initials show in slate-deep on paper. **Never use a stock face.**

| Prop | Type |
| --- | --- |
| `name` | string (required; initials ignore Prof., Dr., Shri, Smt.) |
| `src` | string (optional photo) |
| `size` | `xs` 24 · `sm` 32 · `md` 40 · `lg` 56 · `xl` 80 |
| `presence` | `online` (sage) · `away` (rose) · `offline` (grey), drawn as a square |

`<AvatarGroup names={[…]} max={4} size="sm" />` overlaps avatars and adds a `+N` disc.

### Badges

| Component | Purpose | Key props |
| --- | --- | --- |
| `Badge` | Square status label with a 6px square | `tone`: neutral · info · success · caution · critical. `variant`: outline · soft. `dot` |
| `CountBadge` | Numeric count in nav and tabs | `value` (caps at 99+), `tone`: neutral · critical |
| `StageTag` | The only pill. Live, Pilot or Prototype. | `stage`: live · pilot · prototype |

Rules:

- The word always carries the meaning.
- Use `critical` counts only when action is overdue.
- Stage tags appear on product pages and portfolio grids, not on flyers or covers.

### Button and ButtonGroup

| Variant | Look | Use |
| --- | --- | --- |
| `primary` | Ink fill | The main action on a screen |
| `brand` | Slate-deep fill | The main action inside a module flow (assign, close, save) |
| `secondary` | 1px rule border | Alternative actions |
| `ghost` | No border | Cancel, low-emphasis actions |
| `critical` | Rose-deep fill | Destructive or irreversible actions only |
| `link` | Underlined label colour | Inline navigation |

Props: `variant`, `size` (`sm | md | lg`), `leading` / `trailing` (glyph names), `loading` (shows `StepLoader` and disables the button), `block`, and all native button props.

`IconButton`: `glyph`, `label` (required, becomes the `aria-label` and title), `size`, `variant` (`ghost | secondary`).

`ButtonGroup`: a segmented single-choice control (`role="radiogroup"`). Props: `options` `{ value, label, count? }[]`, `value`, `onChange`, `label`, `size`.

Rules:

- Use one primary or brand button per view.
- Labels are verbs.
- Put the critical button last, and confirm in a modal when the action is irreversible.

### Checkbox and Radio

Square boxes. When checked, the box fills with `brand` and shows a check glyph. Indeterminate shows a minus.

- `Checkbox`: `label`, `description`, `checked`, `indeterminate`, `invalid`, `disabled`, `onChange(checked)`
- `Radio`: `label`, `description`, `name`, `value`, `checked`, `disabled`, `onChange(value)`. It is square with an inset square.

Use parent/child indeterminate states for grouped proof items, such as closure checklists.

### Dropdown

An action menu anchored to a trigger, at elevation level 2.

```tsx
<Dropdown
  align="end"
  trigger={({ open, toggle }) => <IconButton glyph="more" label="Camera actions" onClick={toggle} aria-expanded={open} />}
  items={[
    { type: 'label', label: 'Workflow' },
    { type: 'item', label: 'Assign to officer', shortcut: 'A', onSelect: assign },
    { type: 'separator' },
    { type: 'item', label: 'Disable camera', critical: true, onSelect: disable },
  ]}
/>
```

Item fields: `label`, `hint`, `shortcut`, `disabled`, `critical`, `onSelect`. The menu closes on outside click and on Escape, and arrow keys move focus. Destructive items go last, after a separator.

### Inputs

`Field` wraps any control with a mono label, a required marker (`*` in accent) or "(optional)", and hint or error text.

`Input` props: `label`, `hint`, `error`, `leading` (glyph), `prefix` (for example `+91` or `₹`), `suffix` (for example `per year`), `optional`, and native input props.

`Textarea` props: `label`, `hint`, `error`, `maxLength` (shows a live count), and native textarea props.

Rules:

- Hints state the format.
- Errors name the problem **and** the fix ("Enter all 10 digits. 3 missing.") and show a critical square. `aria-invalid` and `aria-describedby` are set for you.

### Progress indicator

| Component | Use |
| --- | --- |
| `ProgressBar` | Flat, square-ended bar. `label`, `value`, `max`, `tone` (brand · rose · sage · critical), `caption`, `size` (sm · md), `indeterminate` |
| `SegmentedProgress` | Discrete units, such as wards surveyed. `total`, `done`, `label` |
| `Stepper` | Numbered squares joined by a rule. `steps` `{ label, caption? }[]`, `current`, `orientation` (horizontal · vertical) |
| `ProgressRing` | Compact ring with butt caps. `value`, `label`, `size` |

The PGR lifecycle uses `Stepper`: Filed, Assigned, In progress, Resolved, Citizen confirmed.

### Select

A listbox with keyboard support, optional groups, meta text and a filter.

Props: `label`, `options` `{ value, label, meta?, group?, disabled? }[]`, `value`, `onChange`, `placeholder`, `hint`, `error`, `searchable`, `disabled`, `required`.

Use `searchable` and `group` for long lists, such as wards grouped by corporation.

### Slider

A flat track with a square thumb. The value reads in Space Grotesk on the right.

Props: `label`, `value`, `onChange`, `min`, `max`, `step`, `format(v)`, `marks` (tick values with labels), `disabled`, `hint`.

Examples: footage retention (days), early-payment rebate (%), detection confidence.

### Tags

`Tag`: a square chip.

- `onRemove` makes it removable, for active filters.
- `onClick` + `selected` make it a toggle chip that flips to ink when selected.
- `colour` adds a module square (for example `bg-rose` for VMS).

### Text editor

`TextEditor` handles resolution remarks, inspection notes and notice drafts.

- Its toolbar uses **letters and words**, not icons: P, H, B, I, U, S, List, 1. 2., Quote.
- Props: `label`, `initialHTML`, `placeholder`, `maxLength` (counter turns critical when exceeded), `hint`, `footer` (for example autosave status and actions).
- Lists render with the 6px square bullet.

### Toggle

A square switch. The state word ("On" or "Off") sits beside the track.

Props: `label`, `description`, `checked`, `onChange`, `disabled`, `size` (sm · md), `showState`.

Use toggles for settings that take effect at once. Use a checkbox when the change is saved with a form.

### Tooltip

An ink panel with paper text and a square notch. It opens on hover and focus, and Escape closes it.

Props: `content`, `children` (one focusable element), `side` (top · bottom · left · right), `label` (an optional mono heading, for example a camera code).

Use tooltips to define acronyms and terms. **Never** put actions in a tooltip, or the only copy of important information.

---

## 12. Application components

### Alert and notification

| Component | Use |
| --- | --- |
| `Alert` | Inline, built like a blueprint box: a header strip with the status word (Notice, Resolved, Caution, Critical) and a reference `code`, then a `title` heading and one line of context. Props: `tone`, `title`, `children`, `code`, `actions`, `onDismiss`. |
| `Banner` | Full-width system notice. Info and critical banners sit on ink grounds and adapt via `theme-ink`. Props: `tone`, `children`, `action`. |
| `ToastProvider` + `useToast().push({ tone, title, body?, module? })` | Transient confirmation on an ink gradient. Bottom right, up to four at once, auto-dismiss after 5s with a timer bar. |
| `NotificationItem` | A row in the notification centre. Props: `module`, `title`, `body`, `time`, `unread`, `tone`. |

Rules:

- Say what happened and what to do next.
- Critical alerts use `role="alert"`; others use `role="status"`.
- Critical items also stay in the notification centre after the toast leaves.

### Application navigation

| Component | Use |
| --- | --- |
| `ProductLockup` | Logo slot, divider and the product name in Montserrat (`AIRAWAT OS`). |
| `LogoSlot` | Placeholder for the supplied logo artwork. |
| `TopNav` | Module switcher (Grievances, Video, Property tax) with a 2px ink marker on the rule. |
| `SideNav` | Sections with a mono label, a module code and a 6px colour square. The active item fills ink. Counts use `CountBadge`; `urgent` makes the count critical. Optional `footer` for the signed-in user. |

The standard shell is a 56px top bar (lockup, module switcher, command search trigger, alerts, avatar) and a 240px raised sidebar. The content area starts with breadcrumbs, then a running label and headline.

### Breadcrumbs

`Breadcrumbs items={[{ label, onClick? }]}` renders mono labels with slash separators. The last item is the current page (`aria-current="page"`). The trail follows the **place hierarchy**, not click history: City / Zone / Ward / Record.

### Calendar and date picker

| Component | Use |
| --- | --- |
| `Calendar events={[{ date, label, colour }]}` | Month grid with an agenda for the selected day. Events show as 6px squares in the module colour, and the agenda names each one in words. |
| `MonthGrid` | The grid on its own. Props: `value`, `onSelect`, `range`, `minDate`, `events`. |
| `DatePicker` | A field-style trigger that opens a calendar popover. Props: `label`, `value`, `onChange`, `minDate`, `hint`, `placeholder`. |
| `DateRangePicker` | Click a start date, then an end date; days in between fill `selected`. |
| `formatDate(d)` | Formats as `DD Mon YYYY`. |

Weeks start on Monday and cells are square. Today is underlined in the accent. Disabled days are struck through. Arrow keys move, Enter selects and Escape closes.

### Command menu

`CommandMenu open onClose commands` opens with **Ctrl or Cmd + K**. Bind the shortcut at app level.

Each command has `id`, `group`, `label`, `meta`, `shortcut`, `colour` and `onRun`. Results group by Grievances, Cameras, Properties and Actions. Arrow keys move, Enter runs and Escape closes. The empty result suggests what to search for.

### States

| Component | Motif | Required content |
| --- | --- | --- |
| `EmptyState` | Vastu | Why the list is empty, and the next useful step. `title`, `accent`, `body`, `actions`, `label` |
| `SkeletonTable`, `Skeleton` | None | Mirrors the final layout. Use for loads under a few seconds. |
| `ErrorState` | Baoli in a critical frame | What failed in the reader's terms, a reference `code`, and retry first. Nothing the user typed is lost. |
| `OfflineState` | Broken Kolam | That the user is offline, `lastSynced`, `queued` actions, and that work is saved on the device. |
| `Loading`, `StepLoader` | None | Three squares stepping in sequence, always paired with a word. Long jobs use a `ProgressBar` with a count and a time estimate. |

State headlines follow the accent rule: "No grievances match *these filters.*"

### Metrics

| Component | Use |
| --- | --- |
| `StatFigure` | 1px rule above, an outlined figure, and a body-s muted label. Use in rows of three to five. Props: `figure`, `label`, `size`, `stroke`. |
| `MetricCard` | Dashboard tile: a header strip with label and module code, a solid figure and unit, the delta in mono (▲/▼) coloured by whether the change is good (`goodWhen`), a flat bar trend, and a **required** `source` line. |
| `BarList` | Horizontal flat bars with values and a required source caption. |

Rules:

- Only show figures that have a source.
- Mark estimates in the label ("estimated").
- Round large figures in public views ("over ₹100 Cr"). Keep exact figures for audits and reports.

### Modals

`Modal` props: `open`, `onClose`, `label` (header strip), `code` (record reference), `title`, `accent`, `children`, `footer`, `size` (sm · md · lg).

Behaviour: it renders in a portal over the scrim, traps focus, closes on Escape and backdrop click, locks body scroll and returns focus to the trigger.

Rules:

- One decision per modal.
- Destructive confirmations name exactly what changes, and the cancel button says what is kept ("Keep camera on").

### Tabs

`Tabs` props: `items` `{ value, label, count?, disabled? }[]`, `value`, `onChange`, `label`, `variant`. Wrap the content in `TabPanel`.

| Variant | Use |
| --- | --- |
| `line` | Views of one list, on a 1px rule with a 2px ink marker |
| `boxed` | Mode switches, such as Live, Recorded and Detections |
| `vertical` | Sections of a long record, such as a property file |

Arrow keys move between tabs (roving tabindex).

---

## 13. Product conventions

| Product | Code | Series colour | Light ground | Accent | Typical stage |
| --- | --- | --- | --- | --- | --- |
| Public Grievance Redressal | PGR | `bg-slate` | `bg-grad-paper-slate` | slate-deep | Live |
| Video Management System | VMS | `bg-rose` | `bg-grad-paper-slate` | slate-deep | Pilot |
| Property Tax | PT | `bg-sage-deep` | `bg-grad-paper` | ink | Prototype |

Grounds and accents follow the brand guide's case-study colour code ("Video and grievance, Kanpur" and "Property tax, Punjab"). Series colours follow chart order so the three products stay distinct in shared views such as calendars, command results and navigation.

### Reference formats

| Record | Format | Example |
| --- | --- | --- |
| Grievance | `PGR-YY-NNNNN` | `PGR-24-08812` |
| Camera | `CAM-CITY-NNNN` | `CAM-KNP-0417` |
| Property | `CITY-PID-NNNNNN` | `MOH-PID-118204` |
| Error | `MODULE-HTTP-REF` | `PT-503-118204` |

Show codes in `font-mono` or `type-caption`.

### Evidence imagery (VMS)

- Show frames as they are, with thin **white** detection boxes and small paper tags in `type-caption` (Detection, Location, Confidence).
- Caption what was seen: "Seen: Mall Road junction."
- If tags are illustrative, say so ("Tags illustrative").
- Never crop out a timestamp.

---

## 14. Accessibility

Target WCAG 2.2 AA.

- **Contrast:** every semantic text token meets 4.5:1 or better on its ground (see the ratios in [section 4](#4-colour)).
- **Focus:** a visible 2px ring on every interactive element. Never remove it.
- **Not colour alone:** status, stage, presence, toggle state and calendar events all carry words, either visible or as accessible names.
- **Keyboard:** all components work by keyboard. Menus, selects, tabs, calendar and command menu use the arrow keys; Escape closes overlays; modals trap and restore focus.
- **Semantics:** `role="switch"`, `radiogroup`, `tablist`, `listbox`, `menu`, `dialog`, `progressbar`, `status` and `alert` are applied by the components.
- **Names:** icon-only buttons require a `label`. Avatars expose the person's name.
- **Motion:** honour `prefers-reduced-motion`; animations and smooth scrolling are disabled under it.
- **Touch:** controls are at least 40px tall by default. Use `lg` (48px) on field devices.

---

## 15. Extending the system

1. **Start from what exists.** Use an existing component and variant. If none fits, compose primitives. If that fails, build a local component from tokens. Raw values are the last resort.
2. **Add tokens in `src/index.css`** inside `@theme`, and add their ink values inside `@utility theme-ink`.
3. **New gradients** must be added to the gradient table in this document and in `index.css` before use.
4. **New glyphs** must be affordances, drawn as 1.5px square-capped strokes on the 16px grid in `Glyph.tsx`.
5. **New components** use semantic tokens (so they work inside `theme-ink`), square corners, 1px borders, mono labels and no shadows. Export them from `src/ds/index.ts` and add a showcase section.
6. Document every **UI extension** here, with the reason the brand guide did not cover it.

---

## 16. Checklist before release

- [ ] Every figure has a source and a status (installed, measured, associated, estimate, plan).
- [ ] Every acronym is spelled out on first use.
- [ ] Headlines are in sentence case, end with a full stop, and close on one accent.
- [ ] No em dashes, exclamation marks, emoji or sales language.
- [ ] Body text is at least 13px in the interface (14px in print); labels are at least 11px.
- [ ] Text contrast is at least 4.5:1 on its ground.
- [ ] No drop shadows, no flat charcoal grounds, no unapproved gradients.
- [ ] Corners are square except stage tags (pill) and people (round).
- [ ] Status and stage show a word, not just a colour.
- [ ] Logos are supplied artwork only.
- [ ] Every interactive element is reachable by keyboard and has a visible focus ring.
- [ ] Print exports contain no transparency.

---

*Better data. Better decisions. Better cities.*
