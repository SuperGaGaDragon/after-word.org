# Afterword - Frontend Design System

## 1. Core Philosophy

Our design is guided by three principles, inspired by Google's Material Design ethos, but tailored for a focused, iterative writing experience.

- **Clarity and Focus**: The interface must be clean, minimal, and subordinate to the user's content. The primary goal is to create a distraction-free environment for writing and revision. Every element should have a clear purpose.
- **Guided Intentionality**: The design should gently guide the user through the iterative feedback loop. It's not just a tool, but a partner in the writing process. Visual cues will help users understand where they are, what they need to do next, and how they've improved.
- **Meticulous Detail**: We obsess over the small details that enhance usability. Spacing, typography, color, and micro-interactions are precisely calibrated to build trust, reduce cognitive load, and make the feedback process feel both rigorous and rewarding.

---

## 2. Color Palette

The palette is professional, calm, and purposeful. It uses a neutral base with strategic use of color to draw attention to actions and feedback.

- **Primary (Brand & Key Actions)**
  - `Blue-600`: `#1A73E8` (Primary buttons like "Submit", active links, focus rings)
  - `Blue-50`: `#E8F0FE` (Subtle hover states on list items, selected item backgrounds)

- **Neutral (Text & Surfaces)**
  - `Grey-900`: `#202124` (Primary body text, headings)
  - `Grey-700`: `#5F6368` (Secondary text, muted icons, helper text)
  - `Grey-500`: `#9AA0A6` (Borders, disabled text)
  - `Grey-100`: `#F1F3F4` (Page background)
  - `Grey-50`: `#F8F9FA` (Card and panel backgrounds)
  - `White`: `#FFFFFF` (Text editor background, modal backgrounds)

- **Semantic (Feedback & Status)**
  - **Suggestion Severity:**
    - `Red-600`: `#D93025` (High Severity - Grammar)
    - `Orange-600`: `#F97D00` (Medium Severity - Clarity, Logic)
    - `Blue-500`: `#1A73E8` (Low Severity - Style, Tone, Conciseness)
  - **User Action:**
    - `Green-600`: `#1E8E3E` (Resolved, Excellent)
    - `Yellow-600`: `#F9AB00` (Partial Improvement)
    - `Grey-700`: `#5F6368` (Rejected, Unsolved)
  - **Informational:**
    - `Teal-700`: `#00796B` (Reflection Comment background)
    - `Teal-50`: `#E0F2F1` (Reflection Comment subtle background)

---

## 3. Typography

We will use **Inter**, a clean, highly-readable sans-serif font designed for user interfaces. It offers excellent legibility at all sizes.

- **Font Family**: `'Inter', sans-serif`

- **Scale & Weight**:
  - `H1 / Page Title`: 28px, Bold (700)
  - `H2 / Panel Title`: 22px, Semi-Bold (600)
  - `H3 / Card Title`: 18px, Semi-Bold (600)
  - `Body (Editor)`: 16px, Regular (400), `line-height: 1.7`
  - `Body (UI Text)`: 14px, Regular (400)
  - `Small / Helper Text`: 12px, Regular (400)
  - `Button`: 14px, Semi-Bold (600)

---

## 4. Layout & Spacing

A consistent 8px grid system provides rhythm and visual harmony.

- **Base Unit**: 8px
- **Gutters**: 24px (3 units)
- **Main Layout (Work Editor)**:
  - A two-column layout.
  - **Left Panel (Editor)**: 60% of width.
  - **Right Panel (AI Feedback)**: 40% of width.
  - A subtle `1px` border (`Grey-300`) separates the panels.
- **Max Width**: The main content container will have a max-width of `1600px` to ensure comfortable line lengths on large screens.
- **Padding**:
  - Page-level padding: `32px`
  - Panel padding: `24px`
  - Card padding: `16px`

---

## 5. Component Style Guide

### Text Editor
- **Background**: `#FFFFFF`
- **Caret**: `Blue-600` (`#1A73E8`)
- **Text Selection**: `Blue-50` (`#E8F0FE`) with `Blue-200` border for contrast.
- **Highlighted Text (for Sentence Comments)**:
  - The text itself is not colored, but receives a subtle, sharp underline. The underline color corresponds to the suggestion's severity.
  - **Default State**: A dashed underline (e.g., `2px dashed #D93025`).
  - **Hover State**: The underline becomes solid and slightly thicker. The background of the highlighted text gets a very light tint (e.g., `rgba(217, 48, 37, 0.05)`). This provides a clear target area.
  - **Active State (when its comment is selected)**: The background tint becomes more pronounced (e.g., `rgba(217, 48, 37, 0.15)`).

### AI Feedback Panel

#### FAO & Reflection Comments
- **FAO Comment**: Presented in a simple card with a title "Overall Assessment".
- **Reflection Comment**: Visually distinct. The card has a light background tint (`Teal-50`) and a `2px` solid left border of `Teal-700`. This frames it as a meta-commentary from the AI.

#### Sentence Comment Cards
This is the core interaction. Each card is an actionable item.

- **Card Structure**:
  - **Header**: Contains an icon for the category (e.g., a gear for 'Style', a lightbulb for 'Clarity'), the category name, and the severity level as a colored dot.
  - **Body**: The AI's explanation of the issue.
  - **Footer**: Action buttons ("Mark as Resolved", "Reject").

- **State Visualization**:
  - **Default (Unprocessed)**: A standard card.
  - **User Action Selected (pre-submit)**:
    - **Resolved**: The card's left border turns `Green-600`. A small "Resolved" chip appears in the header. If the user adds a note, an icon indicates this.
    - **Rejected**: The card's left border turns `Grey-700`. A "Rejected" chip appears. The card's opacity is slightly reduced to de-emphasize it.
  - **Post-Submit (AI's evaluation of the fix)**:
    - The card now displays the AI's follow-up feedback prominently. A colored chip and icon clearly state the result:
      - `Excellent`: Green chip, checkmark icon.
      - `Partial`: Yellow chip, half-filled circle icon.
      - `Unsolved`: Grey chip, 'x' icon.
      - `New Issue`: A new card is generated, linked to the original if possible.

### Buttons
- **Primary ("Submit")**: Solid `Blue-600` background, white text. On hover, background becomes `Blue-700`. Disabled state is `Grey-200` background with `Grey-500` text.
- **Secondary ("Save Draft")**: Outlined button. `1px` solid `Grey-500` border, `Blue-600` text. On hover, background becomes `Blue-50`.
- **Tertiary (Icon Buttons)**: Simple icons with a transparent background. On hover, a circular `Grey-100` background appears.

### Version History
- **Slider (Drafts)**: A minimal slider at the bottom of the editor. A simple track with tick marks for each auto-saved draft. The handle is a small circle. On hover, a tooltip shows the timestamp of the draft.
- **History Page (Submitted)**: A vertical timeline. Each entry is a card with the version number, date, and a "View" and "Revert" button. The current version is highlighted.

---

## 6. Iconography

We will use **Material Symbols (Outlined)** for a consistent, modern, and lightweight feel. Examples:
- `edit` for Edit
- `delete` for Delete
- `add` for New Work
- `check_circle` for Resolved
- `cancel` for Reject
- `history` for Version History
- `lightbulb` for Clarity suggestions
- `build` for Style suggestions

---

## 7. Micro-interactions & Animations

Animations will be purposeful and brief (`150ms - 250ms`), using `ease-out` curves.

- **Button Press**: A subtle scale down (`scale(0.98)`) on press.
- **Panel Transition**: When showing/hiding panels, a smooth slide and fade.
- **Loading State**: The "Submit" button transitions into a circular progress indicator, maintaining its position and size to avoid layout shifts.
- **Card Selection**: When a user clicks highlighted text in the editor, the corresponding comment card in the right panel scrolls smoothly into view and flashes a subtle background highlight (`Blue-50`) for `500ms`.
- **Status Update**: When marking a comment "Resolved" or "Rejected", the chip and border color animate in smoothly.
