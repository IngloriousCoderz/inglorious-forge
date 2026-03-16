import { html } from "@inglorious/web"

import { button } from "../../controls/button/index.js"
import { buttonGroup } from "../../controls/button-group/index.js"
import { checkbox } from "../../controls/checkbox/index.js"
import { combobox } from "../../controls/combobox/index.js"
import { fab } from "../../controls/fab/index.js"
import { iconButton } from "../../controls/icon-button/index.js"
import { input } from "../../controls/input/index.js"
import { radioGroup } from "../../controls/radio-group/index.js"
import { rating } from "../../controls/rating/index.js"
import { select } from "../../controls/select/index.js"
import { slider } from "../../controls/slider/index.js"
import { switchControl } from "../../controls/switch/index.js"
import { avatar } from "../../data-display/avatar/index.js"
import { badge } from "../../data-display/badge/index.js"
import { chip } from "../../data-display/chip/index.js"
import { dataGrid } from "../../data-display/data-grid/index.js"
import { divider } from "../../data-display/divider/index.js"
import { icon } from "../../data-display/icon/index.js"
import { list } from "../../data-display/list/index.js"
import { materialIcon } from "../../data-display/material-icon/index.js"
import { table } from "../../data-display/table/index.js"
import { tooltip } from "../../data-display/tooltip/index.js"
import { typography } from "../../data-display/typography/index.js"
import { alert } from "../../feedback/alert/index.js"
import { backdrop } from "../../feedback/backdrop/index.js"
import { dialog } from "../../feedback/dialog/index.js"
import { progress } from "../../feedback/progress/index.js"
import { skeleton } from "../../feedback/skeleton/index.js"
import { snackbar } from "../../feedback/snackbar/index.js"
import { container } from "../../layout/container/index.js"
import { flex } from "../../layout/flex/index.js"
import { grid } from "../../layout/grid/index.js"
import { bottomNavigation } from "../../navigation/bottom-navigation/index.js"
import { breadcrumbs } from "../../navigation/breadcrumbs/index.js"
import { drawer } from "../../navigation/drawer/index.js"
import { link } from "../../navigation/link/index.js"
import { menu } from "../../navigation/menu/index.js"
import { pagination } from "../../navigation/pagination/index.js"
import { speedDial } from "../../navigation/speed-dial/index.js"
import { stepper } from "../../navigation/stepper/index.js"
import { tabs } from "../../navigation/tabs/index.js"
import { accordion } from "../../surfaces/accordion/index.js"
import { appBar } from "../../surfaces/app-bar/index.js"
import { card } from "../../surfaces/card/index.js"
import { paper } from "../../surfaces/paper/index.js"

const categoryMeta = {
  layout: {
    label: "Layout",
    summary:
      "Layout primitives define structure, spacing, and responsive flow.",
    verb: "structuring pages and layouts",
    useCases: [
      "Scaffold page sections",
      "Control spacing and alignment",
      "Build responsive grids",
    ],
  },
  controls: {
    label: "Controls",
    summary: "Controls capture user input and trigger actions.",
    verb: "capturing user input and actions",
    useCases: ["Primary actions", "Form inputs", "State toggles"],
  },
  "data-display": {
    label: "Data Display",
    summary:
      "Data display primitives present information, status, and metrics.",
    verb: "presenting data and status",
    useCases: ["Show metrics", "Summarize status", "Structure dense data"],
  },
  feedback: {
    label: "Feedback",
    summary: "Feedback primitives communicate system state and validation.",
    verb: "communicating system state and validation",
    useCases: ["Surface errors", "Indicate progress", "Confirm system actions"],
  },
  navigation: {
    label: "Navigation",
    summary:
      "Navigation primitives help users move between views and sections.",
    verb: "moving between views and sections",
    useCases: ["App-level navigation", "In-page navigation", "Wayfinding"],
  },
  surfaces: {
    label: "Surfaces",
    summary: "Surfaces group content and provide visual hierarchy.",
    verb: "grouping and layering content",
    useCases: [
      "Content containment",
      "Elevation and hierarchy",
      "Section organization",
    ],
  },
}

const previewRow = (children) =>
  html`<div class="iw-primitive-preview-row">${children}</div>`

const previewColumn = (children) =>
  html`<div class="iw-primitive-preview-column">${children}</div>`

const primitiveDetailsByPath = {
  "/layout/container": {
    summary: "Constrains content width and applies consistent gutters.",
    description:
      "Container is the primary boundary component for predictable line length and horizontal rhythm.",
    useCases: [
      "Page shell sections",
      "Readable content columns",
      "Consistent guttering",
    ],
    example: {
      code: `import { container } from "@inglorious/ui/container"
import { typography } from "@inglorious/ui/typography"

container.render({
  maxWidth: "md",
  padding: "lg",
  children: typography.render({
    variant: "h6",
    children: "Content width locked to md"
  })
})`,
      preview: () =>
        container.render({
          maxWidth: "md",
          padding: "lg",
          children: typography.render({
            variant: "h6",
            children: "Content width locked to md",
          }),
        }),
    },
  },
  "/layout/flex": {
    summary: "Row/column layout with alignment, gap, and wrapping control.",
    description:
      "Flex composes horizontal and vertical stacks without custom CSS rules for spacing and alignment.",
    useCases: ["Toolbar rows", "Form stacks", "Inline actions"],
    example: {
      code: `import { flex } from "@inglorious/ui/flex"
import { paper } from "@inglorious/ui/paper"

flex.render({
  align: "center",
  gap: "sm",
  children: [
    paper.render({ padding: "sm", children: "Left" }),
    paper.render({ padding: "sm", children: "Right" })
  ]
})`,
      preview: () =>
        flex.render({
          align: "center",
          gap: "sm",
          children: [
            paper.render({ padding: "sm", children: "Left" }),
            paper.render({ padding: "sm", children: "Right" }),
          ],
        }),
    },
  },
  "/layout/grid": {
    summary: "Responsive grid with consistent spacing and auto-wrapping.",
    description:
      "Grid is ideal for dashboards and card layouts where column count varies by viewport.",
    useCases: ["Card galleries", "Metric grids", "Dashboard panels"],
    example: {
      code: `import { grid } from "@inglorious/ui/grid"
import { paper } from "@inglorious/ui/paper"

grid.render({
  minColumnWidth: "10rem",
  gap: "sm",
  children: [
    paper.render({ padding: "sm", children: "A" }),
    paper.render({ padding: "sm", children: "B" }),
    paper.render({ padding: "sm", children: "C" }),
    paper.render({ padding: "sm", children: "D" })
  ]
})`,
      preview: () =>
        grid.render({
          minColumnWidth: "10rem",
          gap: "sm",
          children: [
            paper.render({ padding: "sm", children: "A" }),
            paper.render({ padding: "sm", children: "B" }),
            paper.render({ padding: "sm", children: "C" }),
            paper.render({ padding: "sm", children: "D" }),
          ],
        }),
    },
  },
  "/controls/button": {
    summary: "Action trigger with variants, colors, and shapes.",
    description:
      "Button exposes stateful styles for primary, secondary, and destructive actions.",
    useCases: ["Primary CTAs", "Dialog actions", "Toolbar commands"],
    example: {
      code: `import { button } from "@inglorious/ui/button"

button.render({
  variant: "default",
  color: "primary",
  children: "Save changes"
})`,
      preview: () =>
        previewRow([
          button.render({
            variant: "default",
            color: "primary",
            children: "Primary",
          }),
          button.render({
            variant: "outline",
            color: "primary",
            children: "Outline",
          }),
          button.render({
            variant: "ghost",
            color: "secondary",
            children: "Ghost",
          }),
        ]),
    },
  },
  "/controls/button-group": {
    summary: "Grouped buttons for segmented or multi-select actions.",
    description:
      "Button Group handles selection state while keeping controls visually attached.",
    useCases: ["Segmented filters", "Mode switches", "Batch actions"],
    example: {
      code: `import { buttonGroup } from "@inglorious/ui/button-group"

buttonGroup.render({
  value: "week",
  buttons: [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" }
  ]
})`,
      preview: () =>
        buttonGroup.render({
          value: "week",
          buttons: [
            { id: "day", label: "Day" },
            { id: "week", label: "Week" },
            { id: "month", label: "Month" },
          ],
        }),
    },
  },
  "/controls/checkbox": {
    summary: "Binary choice with optional indeterminate state.",
    description:
      "Checkboxes allow multi-select within lists and forms while staying compact.",
    useCases: ["Bulk selection", "Settings toggles", "Agreement fields"],
    example: {
      code: `import { checkbox } from "@inglorious/ui/checkbox"

checkbox.render({
  label: "Send weekly report",
  isChecked: true
})`,
      preview: () =>
        previewColumn([
          checkbox.render({
            label: "Send weekly report",
            isChecked: true,
          }),
          checkbox.render({
            label: "Email notifications",
            isChecked: false,
          }),
        ]),
    },
  },
  "/controls/combobox": {
    summary: "Searchable dropdown with multi-select and tag support.",
    description:
      "Combobox facilitates selection from large option sets with autocomplete, tag-based multi-select, and custom filtering.",
    useCases: ["Tag selection", "Data filtering", "Complex forms"],
    example: {
      code: `import { combobox } from "@inglorious/ui/combobox"

combobox.render({
  label: "Frameworks",
  placeholder: "Select frameworks...",
  isMulti: true,
  isSearchable: true,
  isClearable: true,
  options: [
    { label: "React", value: "react" },
    { label: "Angular", value: "angular" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
    { label: "Inglorious", value: "inglorious" }
  ],
  selectedValue: ["inglorious"]
})`,
      preview: () =>
        combobox.render({
          label: "Frameworks",
          placeholder: "Select frameworks...",
          isMulti: true,
          isSearchable: true,
          isClearable: true,
          options: [
            { label: "React", value: "react" },
            { label: "Angular", value: "angular" },
            { label: "Vue", value: "vue" },
            { label: "Svelte", value: "svelte" },
            { label: "Inglorious", value: "inglorious" },
          ],
          selectedValue: ["inglorious"],
        }),
    },
  },
  "/controls/fab": {
    summary: "Floating action button for dominant, contextual actions.",
    description:
      "FABs emphasize the most important action in a view, especially on mobile.",
    useCases: ["Create actions", "Quick add", "Contextual primary"],
    example: {
      code: `import { fab } from "@inglorious/ui/fab"

fab.render({
  isExtended: true,
  children: "Create"
})`,
      preview: () =>
        previewRow([
          fab.render({ children: "+" }),
          fab.render({ isExtended: true, children: "Create" }),
        ]),
    },
  },
  "/controls/icon-button": {
    summary: "Compact icon-only button with optional label.",
    description:
      "Icon Button is optimized for toolbars and dense control clusters.",
    useCases: ["Toolbar controls", "Inline actions", "Overflow triggers"],
    example: {
      code: `import { iconButton } from "@inglorious/ui/icon-button"
import { materialIcon } from "@inglorious/ui/material-icon"

iconButton.render({
  icon: materialIcon.render({ name: "settings" }),
  label: "Settings",
  variant: "ghost"
})`,
      preview: () =>
        previewRow([
          iconButton.render({
            icon: materialIcon.render({ name: "settings" }),
            label: "Settings",
            variant: "ghost",
          }),
          iconButton.render({
            icon: materialIcon.render({ name: "favorite" }),
            label: "Favorite",
            variant: "ghost",
          }),
        ]),
    },
  },
  "/controls/input": {
    summary: "Text input with labeling, validation, and helper text.",
    description:
      "Input exposes states for errors and hints while keeping layout consistent.",
    useCases: ["Forms", "Search fields", "Inline editing"],
    example: {
      code: `import { input } from "@inglorious/ui/input"

input.render({
  label: "Email",
  inputType: "email",
  placeholder: "name@company.com",
  hint: "We will not share your email"
})`,
      preview: () =>
        previewColumn([
          input.render({
            label: "Email",
            inputType: "email",
            placeholder: "name@company.com",
            hint: "We will not share your email",
            value: "",
          }),
          input.render({
            label: "Password",
            inputType: "password",
            placeholder: "••••••••",
            value: "",
          }),
        ]),
    },
  },
  "/controls/radio-group": {
    summary: "Single-choice selection among visible options.",
    description:
      "Radio Group ensures mutual exclusivity with explicit option labels.",
    useCases: ["Plan selection", "Single-choice forms", "Mode switching"],
    example: {
      code: `import { radioGroup } from "@inglorious/ui/radio-group"

radioGroup.render({
  label: "Billing",
  value: "annual",
  options: [
    { label: "Monthly", value: "monthly" },
    { label: "Annual", value: "annual" }
  ]
})`,
      preview: () =>
        radioGroup.render({
          label: "Billing",
          value: "annual",
          options: [
            { label: "Monthly", value: "monthly" },
            { label: "Annual", value: "annual" },
          ],
        }),
    },
  },
  "/controls/rating": {
    summary: "Discrete rating control with custom symbols.",
    description:
      "Rating captures qualitative feedback with a numeric value backing it.",
    useCases: ["Reviews", "Quality scoring", "Satisfaction"],
    example: {
      code: `import { rating } from "@inglorious/ui/rating"

rating.render({
  value: 4,
  max: 5
})`,
      preview: () => rating.render({ value: 4, max: 5 }),
    },
  },
  "/controls/select": {
    summary: "Dropdown selection for compact option lists.",
    description:
      "Select keeps forms tight while preserving clear option labels.",
    useCases: ["Filters", "Country selectors", "Form fields"],
    example: {
      code: `import { select } from "@inglorious/ui/select"

select.render({
  value: "active",
  options: [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "archived", label: "Archived" }
  ]
})`,
      preview: () =>
        select.render({
          value: "active",
          options: [
            { value: "active", label: "Active" },
            { value: "paused", label: "Paused" },
            { value: "archived", label: "Archived" },
          ],
        }),
    },
  },
  "/controls/slider": {
    summary: "Continuous range input with numeric feedback.",
    description:
      "Slider is ideal for approximate values like volume or thresholds.",
    useCases: ["Range filters", "Preference tuning", "Threshold settings"],
    example: {
      code: `import { slider } from "@inglorious/ui/slider"

slider.render({
  label: "Volume",
  value: 32,
  min: 0,
  max: 100
})`,
      preview: () =>
        slider.render({ label: "Volume", value: 32, min: 0, max: 100 }),
    },
  },
  "/controls/switch": {
    summary: "Binary toggle with immediate state feedback.",
    description:
      "Switches represent live state and can be flipped without confirmation.",
    useCases: ["Feature flags", "Settings", "Live states"],
    example: {
      code: `import { switchControl } from "@inglorious/ui/switch"

switchControl.render({
  label: "Auto-sync",
  isChecked: true
})`,
      preview: () =>
        previewColumn([
          switchControl.render({ label: "Auto-sync", isChecked: true }),
          switchControl.render({ label: "Offline mode", isChecked: false }),
        ]),
    },
  },
  "/data-display/avatar": {
    summary: "Identity marker with image, initials, or fallback content.",
    description:
      "Avatar supports automatic color hashing and multiple shapes/sizes.",
    useCases: ["User lists", "Assignees", "Account menus"],
    example: {
      code: `import { avatar } from "@inglorious/ui/avatar"

avatar.render({
  initials: "JD",
  color: "auto"
})`,
      preview: () =>
        previewRow([
          avatar.render({ initials: "JD", color: "auto" }),
          avatar.render({ src: "/transparent.png", shape: "square" }),
        ]),
    },
  },
  "/data-display/badge": {
    summary: "Compact label for status, counts, or metadata.",
    description: "Badges are lightweight chips for quick semantic emphasis.",
    useCases: ["Status tags", "Counts", "Category labels"],
    example: {
      code: `import { badge } from "@inglorious/ui/badge"

badge.render({
  color: "success",
  children: "LIVE"
})`,
      preview: () =>
        previewRow([
          badge.render({ color: "success", children: "LIVE" }),
          badge.render({ color: "warning", children: "BETA" }),
          badge.render({ color: "info", children: "NEW" }),
        ]),
    },
  },
  "/data-display/chip": {
    summary: "Compact token for filters, tags, or selections.",
    description: "Chips are best for quick filters or removable selections.",
    useCases: ["Tag lists", "Filter pills", "Multi-select"],
    example: {
      code: `import { chip } from "@inglorious/ui/chip"

chip.render({
  children: "Priority: High",
  color: "warning"
})`,
      preview: () =>
        previewRow([
          chip.render({ children: "Priority: High", color: "warning" }),
          chip.render({ children: "Assigned", color: "success" }),
          chip.render({ children: "Blocked", color: "error" }),
        ]),
    },
  },
  "/data-display/data-grid": {
    summary: "Feature-rich data grid with sorting, filtering, and paging.",
    description:
      "Data Grid supports structured datasets with built-in pagination and search hooks.",
    useCases: ["Admin tables", "Operational dashboards", "Data exports"],
    example: {
      code: `import { dataGrid } from "@inglorious/ui/data-grid"

dataGrid.render({
  rowId: "id",
  columns: [
    { id: "id", title: "ID", type: "number", isSortable: true },
    { id: "name", title: "Name" },
    { id: "status", title: "Status" }
  ],
  rows: [
    { id: 1, name: "Alpha", status: "Active" },
    { id: 2, name: "Beta", status: "Paused" },
    { id: 3, name: "Gamma", status: "Active" }
  ],
  filters: {},
  sorts: [],
  selection: [],
  pagination: { page: 0, pageSize: 3, pageSizes: [3, 6] }
})`,
      preview: () =>
        dataGrid.render({
          rowId: "id",
          columns: [
            { id: "id", title: "ID", type: "number", isSortable: true },
            { id: "name", title: "Name" },
            { id: "status", title: "Status" },
          ],
          rows: [
            { id: 1, name: "Alpha", status: "Active" },
            { id: 2, name: "Beta", status: "Paused" },
            { id: 3, name: "Gamma", status: "Active" },
          ],
          filters: {},
          sorts: [],
          selection: [],
          pagination: { page: 0, pageSize: 3, pageSizes: [3, 6] },
        }),
    },
  },
  "/data-display/divider": {
    summary: "Lightweight separator between content groups.",
    description:
      "Divider adds visual rhythm without introducing heavy borders.",
    useCases: ["Section boundaries", "List grouping", "Sidebars"],
    example: {
      code: `import { divider } from "@inglorious/ui/divider"

divider.render({ orientation: "horizontal" })`,
      preview: () =>
        previewColumn([
          typography.render({ variant: "body2", children: "Section A" }),
          divider.render({ orientation: "horizontal" }),
          typography.render({ variant: "body2", children: "Section B" }),
        ]),
    },
  },
  "/data-display/icon": {
    summary: "Generic icon wrapper with size and color control.",
    description:
      "Icon is a neutral wrapper for SVGs or glyphs within UI layouts.",
    useCases: ["Inline cues", "Status indicators", "UI affordances"],
    example: {
      code: `import { icon } from "@inglorious/ui/icon"

icon.render({
  size: "lg",
  children: "★"
})`,
      preview: () =>
        previewRow([
          icon.render({ size: "lg", children: "★" }),
          icon.render({ size: "lg", children: "⚡" }),
        ]),
    },
  },
  "/data-display/list": {
    summary: "Structured lists with optional icons and secondary text.",
    description:
      "List supports nested items, selection state, and action affordances.",
    useCases: ["Navigation menus", "Activity feeds", "Result lists"],
    example: {
      code: `import { list } from "@inglorious/ui/list"

list.render({
  items: [
    { id: "alpha", primary: "Alpha", secondary: "Ready" },
    { id: "beta", primary: "Beta", secondary: "Paused" }
  ]
})`,
      preview: () =>
        list.render({
          isInset: true,
          items: [
            {
              id: "alpha",
              primary: "Alpha",
              secondary: "Ready",
              icon: materialIcon.render({ name: "bolt", size: "sm" }),
            },
            {
              id: "beta",
              primary: "Beta",
              secondary: "Paused",
              icon: materialIcon.render({ name: "pause", size: "sm" }),
            },
          ],
        }),
    },
  },
  "/data-display/material-icon": {
    summary: "Material Symbols integration with consistent sizing.",
    description:
      "Material Icon renders Material Symbols with predefined size tokens.",
    useCases: ["Standard iconography", "Toolbar actions", "Menus"],
    example: {
      code: `import { materialIcon } from "@inglorious/ui/material-icon"

materialIcon.render({ name: "bolt", size: "lg" })`,
      preview: () =>
        previewRow([
          materialIcon.render({ name: "bolt", size: "lg" }),
          materialIcon.render({ name: "settings", size: "lg" }),
          materialIcon.render({ name: "layers", size: "lg" }),
        ]),
    },
  },
  "/data-display/table": {
    summary: "Lightweight table for structured data.",
    description:
      "Table is a minimal data layout when you do not need full grid features.",
    useCases: ["Reports", "Billing summaries", "Audit tables"],
    example: {
      code: `import { table } from "@inglorious/ui/table"

table.render({
  isStriped: true,
  columns: [
    { id: "name", label: "Name" },
    { id: "role", label: "Role" }
  ],
  rows: [
    { id: 1, name: "Alex", role: "Owner" },
    { id: 2, name: "Sam", role: "Editor" }
  ]
})`,
      preview: () =>
        table.render({
          isStriped: true,
          columns: [
            { id: "name", label: "Name" },
            { id: "role", label: "Role" },
          ],
          rows: [
            { id: 1, name: "Alex", role: "Owner" },
            { id: 2, name: "Sam", role: "Editor" },
          ],
        }),
    },
  },
  "/data-display/tooltip": {
    summary: "On-hover or focus help text for dense UIs.",
    description:
      "Tooltip keeps interfaces clean while still exposing contextual help.",
    useCases: ["Icon explanations", "Truncated labels", "Inline hints"],
    example: {
      code: `import { tooltip } from "@inglorious/ui/tooltip"

tooltip.render({
  isOpen: true,
  content: "Copy to clipboard",
  children: "Hover me"
})`,
      preview: () =>
        tooltip.render({
          isOpen: true,
          content: "Copy to clipboard",
          children: iconButton.render({
            icon: materialIcon.render({ name: "content_copy" }),
            label: "Copy",
            variant: "ghost",
          }),
        }),
    },
  },
  "/data-display/typography": {
    summary: "Text styles for hierarchy and consistent rhythm.",
    description:
      "Typography tokens enforce consistent sizing, weight, and color across surfaces.",
    useCases: ["Headings", "Body text", "Meta labels"],
    example: {
      code: `import { typography } from "@inglorious/ui/typography"

typography.render({
  variant: "h5",
  children: "Section title"
})`,
      preview: () =>
        previewColumn([
          typography.render({ variant: "h5", children: "Section title" }),
          typography.render({
            variant: "body1",
            children: "Body text uses a readable line height.",
          }),
          typography.render({
            variant: "body2",
            color: "secondary",
            children: "Secondary metadata label",
          }),
        ]),
    },
  },
  "/feedback/alert": {
    summary: "Inline status messaging with severity and variants.",
    description:
      "Alert surfaces contextual feedback without interrupting the flow.",
    useCases: ["Validation errors", "Success banners", "System warnings"],
    example: {
      code: `import { alert } from "@inglorious/ui/alert"

alert.render({
  title: "Payment failed",
  description: "Card expired on 04/24",
  severity: "error"
})`,
      preview: () =>
        alert.render({
          title: "Payment failed",
          description: "Card expired on 04/24",
          severity: "error",
        }),
    },
  },
  "/feedback/backdrop": {
    summary: "Blocking overlay to focus attention or indicate loading.",
    description:
      "Backdrop dims the app surface and optionally displays a loading cue.",
    useCases: ["Blocking operations", "Modal focus", "Loading states"],
    example: {
      code: `import { backdrop } from "@inglorious/ui/backdrop"

backdrop.render({
  isOpen: true,
  children: "Processing..."
})`,
      preview: () =>
        backdrop.render({
          isOpen: true,
          children: "Processing...",
        }),
    },
  },
  "/feedback/dialog": {
    summary: "Modal dialog for confirmations and focused tasks.",
    description:
      "Dialog interrupts flow for explicit confirmation or data entry.",
    useCases: ["Destructive actions", "Confirmations", "Focused forms"],
    example: {
      code: `import { dialog } from "@inglorious/ui/dialog"
import { button } from "@inglorious/ui/button"

dialog.render({
  isOpen: true,
  title: "Delete record",
  description: "This action cannot be undone.",
  actions: button.render({ children: "Confirm" })
})`,
      preview: () =>
        dialog.render({
          isOpen: true,
          title: "Delete record",
          description: "This action cannot be undone.",
          actions: previewRow([
            button.render({
              variant: "ghost",
              color: "secondary",
              children: "Cancel",
            }),
            button.render({
              variant: "default",
              color: "error",
              children: "Delete",
            }),
          ]),
        }),
    },
  },
  "/feedback/progress": {
    summary: "Linear or circular progress indicators.",
    description:
      "Progress communicates activity for async or long-running operations.",
    useCases: ["Uploads", "Background tasks", "Step completion"],
    example: {
      code: `import { progress } from "@inglorious/ui/progress"

progress.render({
  variant: "linear",
  value: 45
})`,
      preview: () =>
        previewColumn([
          progress.render({ variant: "linear", value: 45 }),
          progress.render({ variant: "circular", value: 72, size: 48 }),
        ]),
    },
  },
  "/feedback/skeleton": {
    summary: "Placeholder surfaces to reduce perceived loading time.",
    description: "Skeleton preserves layout while content is still loading.",
    useCases: ["Card placeholders", "List loading", "Async fetches"],
    example: {
      code: `import { skeleton } from "@inglorious/ui/skeleton"

skeleton.render({
  variant: "text",
  lines: 3
})`,
      preview: () =>
        previewColumn([
          skeleton.render({ variant: "text", lines: 3 }),
          skeleton.render({ variant: "rect", height: 80 }),
        ]),
    },
  },
  "/feedback/snackbar": {
    summary: "Transient notification with optional action.",
    description: "Snackbar provides quick feedback without blocking the user.",
    useCases: ["Save confirmations", "Undo prompts", "Background updates"],
    example: {
      code: `import { snackbar } from "@inglorious/ui/snackbar"

snackbar.render({
  isOpen: true,
  message: "Saved",
  action: "Undo"
})`,
      preview: () =>
        snackbar.render({
          isOpen: true,
          message: "Saved",
          action: link.render({ href: "#", children: "Undo" }),
        }),
    },
  },
  "/navigation/bottom-navigation": {
    summary: "Compact mobile navigation with icon labels.",
    description:
      "Bottom Navigation keeps primary destinations reachable on small screens.",
    useCases: ["Mobile apps", "Primary sections", "Quick switching"],
    example: {
      code: `import { bottomNavigation } from "@inglorious/ui/bottom-navigation"

bottomNavigation.render({
  value: 1,
  actions: [
    { label: "Home", icon: "home" },
    { label: "Search", icon: "search" },
    { label: "Profile", icon: "person" }
  ]
})`,
      preview: () =>
        bottomNavigation.render({
          value: 1,
          actions: [
            { label: "Home", icon: materialIcon.render({ name: "home" }) },
            { label: "Search", icon: materialIcon.render({ name: "search" }) },
            { label: "Profile", icon: materialIcon.render({ name: "person" }) },
          ],
        }),
    },
  },
  "/navigation/breadcrumbs": {
    summary: "Hierarchy trail for deep navigation.",
    description:
      "Breadcrumbs communicate location and allow quick jumps to parent levels.",
    useCases: ["Nested pages", "Content hierarchies", "Admin paths"],
    example: {
      code: `import { breadcrumbs } from "@inglorious/ui/breadcrumbs"

breadcrumbs.render({
  items: [
    { label: "Projects", href: "/projects" },
    { label: "Atlas" },
    { label: "Settings" }
  ]
})`,
      preview: () =>
        breadcrumbs.render({
          items: [
            { label: "Projects", href: "/projects" },
            { label: "Atlas" },
            { label: "Settings" },
          ],
        }),
    },
  },
  "/navigation/drawer": {
    summary: "Sidebar navigation with collapsible sections.",
    description:
      "Drawer anchors large navigation trees and can collapse for density.",
    useCases: ["Admin navigation", "Settings menus", "Content trees"],
    example: {
      code: `import { drawer } from "@inglorious/ui/drawer"
import { list } from "@inglorious/ui/list"

drawer.render({
  isOpen: true,
  title: "Navigation",
  children: list.render({ items: [
    { id: "home", primary: "Dashboard" },
    { id: "reports", primary: "Reports" }
  ] })
})`,
      preview: () =>
        drawer.render({
          isOpen: true,
          hasBackdrop: false,
          title: "Navigation",
          children: list.render({
            items: [
              {
                id: "home",
                primary: "Dashboard",
                icon: materialIcon.render({ name: "speed" }),
              },
              {
                id: "reports",
                primary: "Reports",
                icon: materialIcon.render({ name: "bar_chart" }),
              },
            ],
          }),
        }),
    },
  },
  "/navigation/link": {
    summary: "Inline navigation with consistent theme styling.",
    description:
      "Link standardizes color and underline behavior across surfaces.",
    useCases: ["Inline navigation", "Help links", "Secondary actions"],
    example: {
      code: `import { link } from "@inglorious/ui/link"

link.render({
  href: "/docs",
  children: "Read documentation"
})`,
      preview: () =>
        previewRow([
          link.render({ href: "#", children: "Read documentation" }),
          link.render({
            href: "#",
            children: "Release notes",
            underline: "always",
          }),
        ]),
    },
  },
  "/navigation/menu": {
    summary: "Context menu for grouped actions.",
    description:
      "Menu surfaces grouped actions without cluttering the main UI.",
    useCases: ["Overflow menus", "Context actions", "Quick picks"],
    example: {
      code: `import { menu } from "@inglorious/ui/menu"

menu.render({
  isOpen: true,
  items: [
    { label: "Edit" },
    { label: "Duplicate" },
    { hasDivider: true },
    { label: "Archive" }
  ]
})`,
      preview: () =>
        menu.render({
          isOpen: true,
          items: [
            { label: "Edit" },
            { label: "Duplicate" },
            { hasDivider: true },
            { label: "Archive" },
          ],
        }),
    },
  },
  "/navigation/pagination": {
    summary: "Page controls for long lists or tables.",
    description: "Pagination keeps dataset navigation fast and accessible.",
    useCases: ["Search results", "Data tables", "Archives"],
    example: {
      code: `import { pagination } from "@inglorious/ui/pagination"

pagination.render({
  page: 2,
  count: 6
})`,
      preview: () => pagination.render({ page: 2, count: 6 }),
    },
  },
  "/navigation/speed-dial": {
    summary: "Expandable action cluster for quick commands.",
    description:
      "Speed Dial groups floating actions and reveals them on interaction.",
    useCases: ["Mobile shortcuts", "Create actions", "Context tools"],
    example: {
      code: `import { speedDial } from "@inglorious/ui/speed-dial"

speedDial.render({
  isOpen: true,
  actions: [
    { label: "Add", icon: "+" },
    { label: "Share", icon: "↗" }
  ]
})`,
      preview: () =>
        speedDial.render({
          isOpen: true,
          actions: [
            { label: "Add", icon: "+" },
            { label: "Share", icon: "↗" },
          ],
        }),
    },
  },
  "/navigation/stepper": {
    summary: "Step-based navigation for multi-stage flows.",
    description:
      "Stepper communicates progress and ordering in multi-step tasks.",
    useCases: ["Checkout", "Onboarding", "Wizard flows"],
    example: {
      code: `import { stepper } from "@inglorious/ui/stepper"

stepper.render({
  activeStep: 1,
  steps: [
    { label: "Details" },
    { label: "Billing" },
    { label: "Confirm" }
  ]
})`,
      preview: () =>
        stepper.render({
          activeStep: 1,
          steps: [
            { label: "Details" },
            { label: "Billing" },
            { label: "Confirm" },
          ],
        }),
    },
  },
  "/navigation/tabs": {
    summary: "Horizontal content switching with panels.",
    description:
      "Tabs keep related content in one location with explicit selection state.",
    useCases: ["Detail views", "Settings", "Section switches"],
    example: {
      code: `import { tabs } from "@inglorious/ui/tabs"

tabs.render({
  value: 0,
  items: [
    { label: "Overview", panel: "Overview content" },
    { label: "Details", panel: "Details content" }
  ]
})`,
      preview: () =>
        tabs.render({
          value: 0,
          items: [
            {
              label: "Overview",
              panel: typography.render({
                variant: "body2",
                children: "Overview content",
              }),
            },
            {
              label: "Details",
              panel: typography.render({
                variant: "body2",
                children: "Details content",
              }),
            },
          ],
        }),
    },
  },
  "/surfaces/accordion": {
    summary: "Collapsible sections for dense content.",
    description:
      "Accordion reveals details on demand while keeping layouts compact.",
    useCases: ["FAQs", "Settings groups", "Detail panels"],
    example: {
      code: `import { accordion } from "@inglorious/ui/accordion"

accordion.render({
  items: [
    { title: "Usage", content: "How to use it", isExpanded: true },
    { title: "API", content: "Props and handlers" }
  ]
})`,
      preview: () =>
        accordion.render({
          items: [
            {
              title: "Usage",
              content: "How to use it",
              isExpanded: true,
            },
            { title: "API", content: "Props and handlers" },
          ],
        }),
    },
  },
  "/surfaces/app-bar": {
    summary: "Top app bar with title, actions, and optional metadata.",
    description:
      "App Bar anchors navigation and global actions in a consistent header.",
    useCases: ["App headers", "Section titles", "Global actions"],
    example: {
      code: `import { appBar } from "@inglorious/ui/app-bar"
import { button } from "@inglorious/ui/button"

appBar.render({
  title: "Project Ops",
  subtitle: "SLA dashboard",
  trailing: button.render({ children: "Share" })
})`,
      preview: () =>
        appBar.render({
          title: "Project Ops",
          subtitle: "SLA dashboard",
          leading: materialIcon.render({ name: "menu" }),
          trailing: button.render({
            variant: "ghost",
            color: "secondary",
            children: "Share",
          }),
        }),
    },
  },
  "/surfaces/card": {
    summary: "Elevated container for grouped content and actions.",
    description:
      "Card provides a flexible surface with optional header and footer sections.",
    useCases: ["Dashboard panels", "Content previews", "Summary blocks"],
    example: {
      code: `import { card } from "@inglorious/ui/card"

card.render({
  title: "Weekly report",
  subtitle: "Updated 2h ago",
  children: "View metrics and KPIs"
})`,
      preview: () =>
        card.render({
          title: "Weekly report",
          subtitle: "Updated 2h ago",
          children: typography.render({
            variant: "body2",
            children: "View metrics and KPIs",
          }),
        }),
    },
  },
  "/surfaces/paper": {
    summary: "Low-elevation surface with configurable padding.",
    description:
      "Paper is the base surface primitive for sections and layout regions.",
    useCases: ["Section backgrounds", "Inset panels", "Content blocks"],
    example: {
      code: `import { paper } from "@inglorious/ui/paper"

paper.render({
  padding: "md",
  children: "Surface content"
})`,
      preview: () =>
        paper.render({
          padding: "md",
          children: typography.render({
            variant: "body2",
            children: "Surface content",
          }),
        }),
    },
  },
}

const primitivePaths = Object.keys(primitiveDetailsByPath)

export const primitiveContentByPath = primitivePaths.reduce((acc, path) => {
  acc[path] = buildContentForPath(path)
  return acc
}, {})

export function getPrimitiveContent(path, entity) {
  if (path && primitiveContentByPath[path]) {
    return primitiveContentByPath[path]
  }

  if (path) {
    const inferred = buildContentForPath(path)
    if (inferred) return inferred
  }

  if (entity?.name || entity?.category) {
    return {
      name: entity?.name ?? "Primitive",
      category: entity?.category ?? "",
      summary: entity?.summary ?? "",
      description: entity?.description ?? "",
      useCases: entity?.useCases ?? [],
      example: entity?.example ?? null,
    }
  }

  return null
}

function buildContentForPath(path) {
  const parts = path?.split("/").filter(Boolean)
  if (!parts || parts.length < 2) return null

  const [categoryKey, nameKey] = parts
  const meta = categoryMeta[categoryKey]
  if (!meta) return null

  const details = primitiveDetailsByPath[path] ?? {}
  const name = details.name ?? toTitleCase(nameKey)
  const category = meta.label

  return {
    name,
    category,
    summary: details.summary ?? meta.summary,
    description:
      details.description ??
      `${name} is a ${category} primitive for ${meta.verb}.`,
    useCases: details.useCases ?? meta.useCases,
    example: details.example ?? null,
  }
}

function toTitleCase(slug) {
  if (!slug) return ""
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
