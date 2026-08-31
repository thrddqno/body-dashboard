# Body Dashboard Tokens

Use these tokens to preserve the current Body Dashboard visual language. Values are extracted from `app/globals.css`.

## Core Color Tokens

| Token | Value | Use |
|---|---:|---|
| `--ink` | `#111827` | Primary text, dark metric panel, target card, primary buttons |
| `--muted` | `#5b6472` | Secondary text, descriptions, metadata |
| `--paper` | `#f6f7f9` | Page background and light topbar base |
| `--card` | `#ffffff` | Calendar cards and light panels |
| `--line` | `#d8dde5` | Borders, dividers, row rules |
| `--green` | `#0f5132` | Brand, training status, weekly summary/gate panels |
| `--lime` | `#d7f171` | Accent on dark green/ink surfaces |
| `--orange` | `#b45309` | Optional/caution status, date accents |
| `--rose` | `#b91c1c` | High-priority warning text |

## Supporting Colors

| Value | Use |
|---:|---|
| `#ffffff` | Top of page gradient, card background |
| `rgba(246, 247, 249, 0.92)` | Sticky topbar background |
| `#54a876` | Read-only live dot |
| `#dbeadd` | Read-only live dot ring |
| `#39413d` | Dividers inside dark metric/target surfaces |
| `#abb3ae` | Muted text inside dark metric/target surfaces |
| `#9aa3af` | Recovery calendar top border |
| `rgba(17, 24, 39, 0.08)` | Calendar hover/selected shadow |
| `#cbd5e1` | Muted text on today's dark calendar card |
| `#f3ded7` | High-priority badge background |
| `#f4ead2` | Medium-priority badge background |
| `#9b6525` | Medium-priority badge text |
| `#dfebde` | Low-priority badge and logged badge background |
| `#48745f` | Internal borders on green cards |
| `#c6d5cc` | Body copy on green cards |
| `#b7c8be` | Metadata on green cards |
| `#d8e5dd` | List text on green cards |
| `#f5b6a0` | Failed gate marker |
| `#a9bdb1` | Gate status label |
| `#91a89a` | Unchecked gate marker |
| `#8a766d` | Estimate/uncertainty note text |
| `#d7d3c8` | Disabled button background |
| `#7b837e` | Disabled button text |

## Typography Tokens

| Token | Value | Use |
|---|---|---|
| `font.sans` | Geist, Arial, Helvetica, sans-serif | Body, labels, controls, dashboard text |
| `font.mono` | Geist Mono, SFMono-Regular, Consolas, monospace | Code-like counters and signal markers |
| `font.serif` | Georgia, Times New Roman, serif | Main headline, secondary headings, large metric values, date numerals |

## Type Scale

| Name | CSS | Use |
|---|---|---|
| Hero headline | `clamp(60px, 8vw, 112px)`, `line-height: 0.84`, `font-weight: 500` | Main page statement |
| Section heading | `38px`, `line-height: 1.02`, `font-weight: 500` | Major dashboard headings |
| Compact section heading | `28px` to `32px` | Calendar plan and side panels |
| Metric value | `29px`, serif | Summary strip values |
| Card date | `26px` to `30px`, serif | Calendar/workout date numerals |
| Body lede | `17px`, `line-height: 1.65` | Hero explanation |
| Body note | `13px`, `line-height: 1.55-1.65` | Messages, plans, notes |
| Metadata label | `10px-12px`, `font-weight: 800-900`, uppercase | Eyebrows, metric labels, badges |
| Small detail | `11px-12px`, `line-height: 1.45-1.5` | Secondary session/plan detail |

Global letter spacing is `0`. Do not add negative letter spacing.

## Spacing Tokens

| Token | Value | Use |
|---|---:|---|
| `shell.max` | `1180px` | Main content width |
| `shell.desktopInset` | `40px total` | Shell width calculation on desktop |
| `shell.mobileInset` | `28px total` | Shell width calculation under 560px |
| `topbar.height` | `68px` | Sticky header height |
| `hero.padding.desktop` | `75px 0 55px` | Hero vertical rhythm |
| `hero.minHeight.desktop` | `390px` | Desktop hero height |
| `section.gap` | `26px` | Stack and two-column gap |
| `twoCol.padding` | `88px 0 35px` | Main dashboard body spacing |
| `calendar.topPadding` | `44px` | Calendar separation from metrics |
| `history.topPadding` | `45px` | Workout log separation |
| `panel.padding` | `24px` | Calendar selected plan |
| `emphasis.padding` | `32px` | Weekly summary, gate, target cards |
| `metric.padding` | `27px 28px` | Summary metric cells |
| `message.padding` | `20px 4px` | Coach note row |
| `session.padding` | `24px 7px` | Workout log summary row |
| `exercise.padding` | `13px 0` | Exercise detail rows |

## Radius Tokens

| Token | Value | Use |
|---|---:|---|
| `radius.default` | `8px` | Cards, badges, buttons, panels |
| `radius.brandMark` | `8px` | Brand mark square |
| `radius.dot` | `50%` | Status dot |

Do not increase card radius unless the whole design system is intentionally revised.

## Border And Shadow Tokens

| Token | Value | Use |
|---|---|---|
| `border.default` | `1px solid var(--line)` | Light cards and dividers |
| `border.dark` | `1px solid #39413d` | Dividers on ink panels |
| `border.green` | `1px solid #48745f` | Dividers on green panels |
| `border.timelineStrong` | `1px solid var(--ink)` | Coach and workout section starts |
| `border.exercise` | `1px dashed var(--line)` | Exercise detail separators |
| `shadow.calendarHover` | `0 8px 24px rgba(17, 24, 39, 0.08)` | Calendar hover/focus/selected state |

## Motion Tokens

| Token | Value | Use |
|---|---|---|
| `motion.short` | `0.18s ease` | Calendar border, shadow, transform |
| `motion.chevron` | `0.2s` | Workout details chevron rotation |
| `motion.hoverLift` | `translateY(-2px)` | Calendar hover/focus/selected |

Use motion only to clarify interactivity. Keep it subtle.

## Semantic Status Tokens

| Semantic | Class | Visual treatment |
|---|---|---|
| Train day | `.calendarDay.train` | Green top border |
| Recovery day | `.calendarDay.recover` | Gray top border |
| Optional day | `.calendarDay.optional` | Orange top border |
| Today | `.calendarDay.today` | Ink background, white text, lime program label |
| Selected day | `.calendarDay.selected` | Ink border and hover shadow |
| High priority | `.priority.high` | Pale red background, rose text |
| Medium priority | `.priority.medium` | Pale tan background, brown-orange text |
| Low priority | `.priority.low` | Pale green background, green text |
| Gate pass | `.gate li.checked` | White text, lime `*` marker |
| Gate watch | `.gate li.watch` | Lime `-` marker |
| Gate fail | `.gate li.fail` | Pale red `!` marker |
| Logged session | `.complete` | Pale green badge, green text |

## Responsive Tokens

| Breakpoint | Rule |
|---|---|
| `max-width: 900px` | Metrics become 2 columns; calendar becomes 2 columns; two-column body becomes 1 column; signal grid becomes 2 columns; exercise rows become 1 column |
| `max-width: 560px` | Shell inset tightens; topbar status is shortened; muted section metadata hides; session logged badge hides; session small note hides; exercise list margin reduces; signal grid becomes 1 column |
