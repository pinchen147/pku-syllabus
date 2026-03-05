# PKU Syllabus

A web app that imports PKU course schedules and exports them as iCalendar (.ICS) files for system calendars.

Modernized fork of [xmcp/pku-syllabus](https://github.com/xmcp/pku-syllabus) — rewritten in TypeScript with a redesigned UI.

## Features

- **Import** — paste from PKU elective system (HTML table or TSV) or re-import a previously exported .ICS file
- **Weekly Calendar View** — CSS Grid calendar with week navigation, odd/even week filtering, and color-coded course blocks
- **Edit** — add, modify, duplicate, or delete courses via modal editor
- **Export** — generate .ICS files compatible with Google Calendar, Outlook, Apple Calendar, and Android
- **Consistent Course Colors** — deterministic hash assigns the same pastel color to courses with the same name

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| UI Components | Ant Design 5 (DatePicker, Modal, Select, Upload) |
| Icons | lucide-react |
| Calendar | ical-generator 10 |
| Routing | React Router 7 |
| Testing | Vitest + Testing Library |
| Package Manager | pnpm |

## Getting Started

```bash
pnpm install
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start dev server |
| `pnpm run build` | Type-check + production build |
| `pnpm test` | Run test suite |
| `pnpm run preview` | Preview production build |

## Project Structure

```
src/
├── components/       # Sidebar, TopBar
├── pages/            # HomePage, Edit, ImportElective, ImportConfig, ExportIcs, About
├── hooks/            # useCourses (state management)
├── lib/              # electiveParser, calendarGenerator
├── styles/           # CSS variables, global reset
├── __tests__/        # Unit tests
├── assets/           # Images
├── types.ts          # Course interface
├── config.ts         # Constants
└── utils.ts          # describeTime, getCourseColor, PERIOD_START_TIMES
```

## Usage Flow

1. **Set semester** — pick the Monday of week 1
2. **Import courses** — paste from elective system or upload .ICS
3. **Edit** — view/modify on the weekly calendar grid
4. **Export** — download .ICS and import into your calendar app

## License

GPL-3.0 — see [LICENSE](https://www.gnu.org/licenses/gpl-3.0.html).

## Credits

Original project by [@xmcp](https://github.com/xmcp). Modernized by [@pinchen147](https://github.com/pinchen147).
