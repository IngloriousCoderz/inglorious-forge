import { html } from "@inglorious/web"

import { Button } from "../../controls/button/index.js"
import { ButtonGroup } from "../../controls/button-group/index.js"
import { Checkbox } from "../../controls/checkbox/index.js"
import { Combobox } from "../../controls/combobox/index.js"
import { Fab } from "../../controls/fab/index.js"
import { IconButton } from "../../controls/icon-button/index.js"
import { Input } from "../../controls/input/index.js"
import { RadioGroup } from "../../controls/radio-group/index.js"
import { Rating } from "../../controls/rating/index.js"
import { Select } from "../../controls/select/index.js"
import { Slider } from "../../controls/slider/index.js"
import { Switch } from "../../controls/switch/index.js"
import { Avatar } from "../../data-display/avatar/index.js"
import { Badge } from "../../data-display/badge/index.js"
import { Chip } from "../../data-display/chip/index.js"
import { DataGrid } from "../../data-display/data-grid/index.js"
import { Divider } from "../../data-display/divider/index.js"
import { Icon } from "../../data-display/icon/index.js"
import { List } from "../../data-display/list/index.js"
import { MaterialIcon } from "../../data-display/material-icon/index.js"
import { Table } from "../../data-display/table/index.js"
import { Tooltip } from "../../data-display/tooltip/index.js"
import { Typography } from "../../data-display/typography/index.js"
import { Alert } from "../../feedback/alert/index.js"
import { Backdrop } from "../../feedback/backdrop/index.js"
import { Dialog } from "../../feedback/dialog/index.js"
import { Progress } from "../../feedback/progress/index.js"
import { Skeleton } from "../../feedback/skeleton/index.js"
import { Snackbar } from "../../feedback/snackbar/index.js"
import { Container } from "../../layout/container/index.js"
import { Flex } from "../../layout/flex/index.js"
import { Grid } from "../../layout/grid/index.js"
import { BottomNavigation } from "../../navigation/bottom-navigation/index.js"
import { Breadcrumbs } from "../../navigation/breadcrumbs/index.js"
import { Drawer } from "../../navigation/drawer/index.js"
import { Link } from "../../navigation/link/index.js"
import { Menu } from "../../navigation/menu/index.js"
import { Pagination } from "../../navigation/pagination/index.js"
import { SpeedDial } from "../../navigation/speed-dial/index.js"
import { Stepper } from "../../navigation/stepper/index.js"
import { Tabs } from "../../navigation/tabs/index.js"
import { Accordion } from "../../surfaces/accordion/index.js"
import { AppBar } from "../../surfaces/app-bar/index.js"
import { Card } from "../../surfaces/card/index.js"
import { Paper } from "../../surfaces/paper/index.js"

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
      code: `import { Container } from "@inglorious/ui/container"
import { Typography } from "@inglorious/ui/typography"

Container.render({
  maxWidth: "md",
  padding: "lg",
  children: Typography.render({
    variant: "h6",
    children: "Content width locked to md"
  })
})`,
      preview: () =>
        Container.render({
          maxWidth: "md",
          padding: "lg",
          children: Typography.render({
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
      code: `import { Flex } from "@inglorious/ui/flex"
import { Paper } from "@inglorious/ui/paper"

Flex.render({
  align: "center",
  gap: "sm",
  children: [
    Paper.render({ padding: "sm", children: "Left" }),
    Paper.render({ padding: "sm", children: "Right" })
  ]
})`,
      preview: () =>
        Flex.render({
          align: "center",
          gap: "sm",
          children: [
            Paper.render({ padding: "sm", children: "Left" }),
            Paper.render({ padding: "sm", children: "Right" }),
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
      code: `import { Grid } from "@inglorious/ui/grid"
import { Paper } from "@inglorious/ui/paper"

Grid.render({
  minColumnWidth: "10rem",
  gap: "sm",
  children: [
    Paper.render({ padding: "sm", children: "A" }),
    Paper.render({ padding: "sm", children: "B" }),
    Paper.render({ padding: "sm", children: "C" }),
    Paper.render({ padding: "sm", children: "D" })
  ]
})`,
      preview: () =>
        Grid.render({
          minColumnWidth: "10rem",
          gap: "sm",
          children: [
            Paper.render({ padding: "sm", children: "A" }),
            Paper.render({ padding: "sm", children: "B" }),
            Paper.render({ padding: "sm", children: "C" }),
            Paper.render({ padding: "sm", children: "D" }),
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
      code: `import { Button } from "@inglorious/ui/button"

Button.render({
  variant: "default",
  color: "primary",
  children: "Save changes"
})`,
      preview: () =>
        previewRow([
          Button.render({
            variant: "default",
            color: "primary",
            children: "Primary",
          }),
          Button.render({
            variant: "outline",
            color: "primary",
            children: "Outline",
          }),
          Button.render({
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
      code: `import { ButtonGroup } from "@inglorious/ui/button-group"

ButtonGroup.render({
  value: "week",
  buttons: [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" }
  ]
})`,
      preview: () =>
        ButtonGroup.render({
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
      code: `import { Checkbox } from "@inglorious/ui/checkbox"

Checkbox.render({
  label: "Send weekly report",
  isChecked: true
})`,
      preview: () =>
        previewColumn([
          Checkbox.render({
            label: "Send weekly report",
            isChecked: true,
          }),
          Checkbox.render({
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
      code: `import { Combobox } from "@inglorious/ui/combobox"

Combobox.render({
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
        Combobox.render({
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
      code: `import { Fab } from "@inglorious/ui/fab"

Fab.render({
  isExtended: true,
  children: "Create"
})`,
      preview: () =>
        previewRow([
          Fab.render({ children: "+" }),
          Fab.render({ isExtended: true, children: "Create" }),
        ]),
    },
  },
  "/controls/icon-button": {
    summary: "Compact icon-only button with optional label.",
    description:
      "Icon Button is optimized for toolbars and dense control clusters.",
    useCases: ["Toolbar controls", "Inline actions", "Overflow triggers"],
    example: {
      code: `import { IconButton } from "@inglorious/ui/icon-button"
import { MaterialIcon } from "@inglorious/ui/material-icon"

IconButton.render({
  icon: MaterialIcon.render({ name: "settings" }),
  label: "Settings",
  variant: "ghost"
})`,
      preview: () =>
        previewRow([
          IconButton.render({
            icon: MaterialIcon.render({ name: "settings" }),
            label: "Settings",
            variant: "ghost",
          }),
          IconButton.render({
            icon: MaterialIcon.render({ name: "favorite" }),
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
      code: `import { Input } from "@inglorious/ui/input"

Input.render({
  label: "Email",
  inputType: "email",
  placeholder: "name@company.com",
  hint: "We will not share your email"
})`,
      preview: () =>
        previewColumn([
          Input.render({
            label: "Email",
            inputType: "email",
            placeholder: "name@company.com",
            hint: "We will not share your email",
            value: "",
          }),
          Input.render({
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
      code: `import { RadioGroup } from "@inglorious/ui/radio-group"

RadioGroup.render({
  label: "Billing",
  value: "annual",
  options: [
    { label: "Monthly", value: "monthly" },
    { label: "Annual", value: "annual" }
  ]
})`,
      preview: () =>
        RadioGroup.render({
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
      code: `import { Rating } from "@inglorious/ui/rating"

Rating.render({
  value: 4,
  max: 5
})`,
      preview: () => Rating.render({ value: 4, max: 5 }),
    },
  },
  "/controls/select": {
    summary: "Dropdown selection for compact option lists.",
    description:
      "Select keeps forms tight while preserving clear option labels.",
    useCases: ["Filters", "Country selectors", "Form fields"],
    example: {
      code: `import { Select } from "@inglorious/ui/select"

Select.render({
  value: "active",
  options: [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "archived", label: "Archived" }
  ]
})`,
      preview: () =>
        Select.render({
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
      code: `import { Slider } from "@inglorious/ui/slider"

Slider.render({
  label: "Volume",
  value: 32,
  min: 0,
  max: 100
})`,
      preview: () =>
        Slider.render({ label: "Volume", value: 32, min: 0, max: 100 }),
    },
  },
  "/controls/switch": {
    summary: "Binary toggle with immediate state feedback.",
    description:
      "Switches represent live state and can be flipped without confirmation.",
    useCases: ["Feature flags", "Settings", "Live states"],
    example: {
      code: `import { Switch } from "@inglorious/ui/switch"

Switch.render({
  label: "Auto-sync",
  isChecked: true
})`,
      preview: () =>
        previewColumn([
          Switch.render({ label: "Auto-sync", isChecked: true }),
          Switch.render({ label: "Offline mode", isChecked: false }),
        ]),
    },
  },
  "/data-display/avatar": {
    summary: "Identity marker with image, initials, or fallback content.",
    description:
      "Avatar supports automatic color hashing and multiple shapes/sizes.",
    useCases: ["User lists", "Assignees", "Account menus"],
    example: {
      code: `import { Avatar } from "@inglorious/ui/avatar"

Avatar.render({
  initials: "JD",
  color: "auto"
})`,
      preview: () =>
        previewRow([
          Avatar.render({ initials: "JD", color: "auto" }),
          Avatar.render({ src: "/transparent.png", shape: "square" }),
        ]),
    },
  },
  "/data-display/badge": {
    summary: "Compact label for status, counts, or metadata.",
    description: "Badges are lightweight chips for quick semantic emphasis.",
    useCases: ["Status tags", "Counts", "Category labels"],
    example: {
      code: `import { Badge } from "@inglorious/ui/badge"

Badge.render({
  color: "success",
  children: "LIVE"
})`,
      preview: () =>
        previewRow([
          Badge.render({ color: "success", children: "LIVE" }),
          Badge.render({ color: "warning", children: "BETA" }),
          Badge.render({ color: "info", children: "NEW" }),
        ]),
    },
  },
  "/data-display/chip": {
    summary: "Compact token for filters, tags, or selections.",
    description: "Chips are best for quick filters or removable selections.",
    useCases: ["Tag lists", "Filter pills", "Multi-select"],
    example: {
      code: `import { Chip } from "@inglorious/ui/chip"

Chip.render({
  children: "Priority: High",
  color: "warning"
})`,
      preview: () =>
        previewRow([
          Chip.render({ children: "Priority: High", color: "warning" }),
          Chip.render({ children: "Assigned", color: "success" }),
          Chip.render({ children: "Blocked", color: "error" }),
        ]),
    },
  },
  "/data-display/data-grid": {
    summary: "Feature-rich data grid with sorting, filtering, and paging.",
    description:
      "Data Grid supports structured datasets with built-in pagination and search hooks.",
    useCases: ["Admin tables", "Operational dashboards", "Data exports"],
    example: {
      code: `import { DataGrid } from "@inglorious/ui/data-grid"

DataGrid.render({
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
        DataGrid.render({
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
      code: `import { Divider } from "@inglorious/ui/divider"

Divider.render({ orientation: "horizontal" })`,
      preview: () =>
        previewColumn([
          Typography.render({ variant: "body2", children: "Section A" }),
          Divider.render({ orientation: "horizontal" }),
          Typography.render({ variant: "body2", children: "Section B" }),
        ]),
    },
  },
  "/data-display/icon": {
    summary: "Generic icon wrapper with size and color control.",
    description:
      "Icon is a neutral wrapper for SVGs or glyphs within UI layouts.",
    useCases: ["Inline cues", "Status indicators", "UI affordances"],
    example: {
      code: `import { Icon } from "@inglorious/ui/icon"

Icon.render({
  size: "lg",
  children: "★"
})`,
      preview: () =>
        previewRow([
          Icon.render({ size: "lg", children: "★" }),
          Icon.render({ size: "lg", children: "⚡" }),
        ]),
    },
  },
  "/data-display/list": {
    summary: "Structured lists with optional icons and secondary text.",
    description:
      "List supports nested items, selection state, and action affordances.",
    useCases: ["Navigation menus", "Activity feeds", "Result lists"],
    example: {
      code: `import { List } from "@inglorious/ui/list"

List.render({
  items: [
    { id: "alpha", primary: "Alpha", secondary: "Ready" },
    { id: "beta", primary: "Beta", secondary: "Paused" }
  ]
})`,
      preview: () =>
        List.render({
          isInset: true,
          items: [
            {
              id: "alpha",
              primary: "Alpha",
              secondary: "Ready",
              icon: MaterialIcon.render({ name: "bolt", size: "sm" }),
            },
            {
              id: "beta",
              primary: "Beta",
              secondary: "Paused",
              icon: MaterialIcon.render({ name: "pause", size: "sm" }),
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
      code: `import { MaterialIcon } from "@inglorious/ui/material-icon"

MaterialIcon.render({ name: "bolt", size: "lg" })`,
      preview: () =>
        previewRow([
          MaterialIcon.render({ name: "bolt", size: "lg" }),
          MaterialIcon.render({ name: "settings", size: "lg" }),
          MaterialIcon.render({ name: "layers", size: "lg" }),
        ]),
    },
  },
  "/data-display/table": {
    summary: "Lightweight table for structured data.",
    description:
      "Table is a minimal data layout when you do not need full grid features.",
    useCases: ["Reports", "Billing summaries", "Audit tables"],
    example: {
      code: `import { Table } from "@inglorious/ui/table"

Table.render({
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
        Table.render({
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
      code: `import { Tooltip } from "@inglorious/ui/tooltip"

Tooltip.render({
  isOpen: true,
  content: "Copy to clipboard",
  children: "Hover me"
})`,
      preview: () =>
        Tooltip.render({
          isOpen: true,
          content: "Copy to clipboard",
          children: IconButton.render({
            icon: MaterialIcon.render({ name: "content_copy" }),
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
      code: `import { Typography } from "@inglorious/ui/typography"

Typography.render({
  variant: "h5",
  children: "Section title"
})`,
      preview: () =>
        previewColumn([
          Typography.render({ variant: "h5", children: "Section title" }),
          Typography.render({
            variant: "body1",
            children: "Body text uses a readable line height.",
          }),
          Typography.render({
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
      code: `import { Alert } from "@inglorious/ui/alert"

Alert.render({
  title: "Payment failed",
  description: "Card expired on 04/24",
  severity: "error"
})`,
      preview: () =>
        Alert.render({
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
      code: `import { Backdrop } from "@inglorious/ui/backdrop"

Backdrop.render({
  isOpen: true,
  children: "Processing..."
})`,
      preview: () =>
        Backdrop.render({
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
      code: `import { Dialog } from "@inglorious/ui/dialog"
import { Button } from "@inglorious/ui/button"

Dialog.render({
  isOpen: true,
  title: "Delete record",
  description: "This action cannot be undone.",
  actions: Button.render({ children: "Confirm" })
})`,
      preview: () =>
        Dialog.render({
          isOpen: true,
          title: "Delete record",
          description: "This action cannot be undone.",
          actions: previewRow([
            Button.render({
              variant: "ghost",
              color: "secondary",
              children: "Cancel",
            }),
            Button.render({
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
      code: `import { Progress } from "@inglorious/ui/progress"

Progress.render({
  variant: "linear",
  value: 45
})`,
      preview: () =>
        previewColumn([
          Progress.render({ variant: "linear", value: 45 }),
          Progress.render({ variant: "circular", value: 72, size: 48 }),
        ]),
    },
  },
  "/feedback/skeleton": {
    summary: "Placeholder surfaces to reduce perceived loading time.",
    description: "Skeleton preserves layout while content is still loading.",
    useCases: ["Card placeholders", "List loading", "Async fetches"],
    example: {
      code: `import { Skeleton } from "@inglorious/ui/skeleton"

Skeleton.render({
  variant: "text",
  lines: 3
})`,
      preview: () =>
        previewColumn([
          Skeleton.render({ variant: "text", lines: 3 }),
          Skeleton.render({ variant: "rect", height: 80 }),
        ]),
    },
  },
  "/feedback/snackbar": {
    summary: "Transient notification with optional action.",
    description: "Snackbar provides quick feedback without blocking the user.",
    useCases: ["Save confirmations", "Undo prompts", "Background updates"],
    example: {
      code: `import { Snackbar } from "@inglorious/ui/snackbar"

Snackbar.render({
  isOpen: true,
  message: "Saved",
  action: "Undo"
})`,
      preview: () =>
        Snackbar.render({
          isOpen: true,
          message: "Saved",
          action: Link.render({ href: "#", children: "Undo" }),
        }),
    },
  },
  "/navigation/bottom-navigation": {
    summary: "Compact mobile navigation with icon labels.",
    description:
      "Bottom Navigation keeps primary destinations reachable on small screens.",
    useCases: ["Mobile apps", "Primary sections", "Quick switching"],
    example: {
      code: `import { BottomNavigation } from "@inglorious/ui/bottom-navigation"

BottomNavigation.render({
  value: 1,
  actions: [
    { label: "Home", icon: "home" },
    { label: "Search", icon: "search" },
    { label: "Profile", icon: "person" }
  ]
})`,
      preview: () =>
        BottomNavigation.render({
          value: 1,
          actions: [
            { label: "Home", icon: MaterialIcon.render({ name: "home" }) },
            { label: "Search", icon: MaterialIcon.render({ name: "search" }) },
            { label: "Profile", icon: MaterialIcon.render({ name: "person" }) },
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
      code: `import { Breadcrumbs } from "@inglorious/ui/breadcrumbs"

Breadcrumbs.render({
  items: [
    { label: "Projects", href: "/projects" },
    { label: "Atlas" },
    { label: "Settings" }
  ]
})`,
      preview: () =>
        Breadcrumbs.render({
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
      code: `import { Drawer } from "@inglorious/ui/drawer"
import { List } from "@inglorious/ui/list"

Drawer.render({
  isOpen: true,
  title: "Navigation",
  children: List.render({ items: [
    { id: "home", primary: "Dashboard" },
    { id: "reports", primary: "Reports" }
  ] })
})`,
      preview: () =>
        Drawer.render({
          isOpen: true,
          hasBackdrop: false,
          title: "Navigation",
          children: List.render({
            items: [
              {
                id: "home",
                primary: "Dashboard",
                icon: MaterialIcon.render({ name: "speed" }),
              },
              {
                id: "reports",
                primary: "Reports",
                icon: MaterialIcon.render({ name: "bar_chart" }),
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
      code: `import { Link } from "@inglorious/ui/link"

Link.render({
  href: "/docs",
  children: "Read documentation"
})`,
      preview: () =>
        previewRow([
          Link.render({ href: "#", children: "Read documentation" }),
          Link.render({
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
      code: `import { Menu } from "@inglorious/ui/menu"

Menu.render({
  isOpen: true,
  items: [
    { label: "Edit" },
    { label: "Duplicate" },
    { hasDivider: true },
    { label: "Archive" }
  ]
})`,
      preview: () =>
        Menu.render({
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
      code: `import { Pagination } from "@inglorious/ui/pagination"

Pagination.render({
  page: 2,
  count: 6
})`,
      preview: () => Pagination.render({ page: 2, count: 6 }),
    },
  },
  "/navigation/speed-dial": {
    summary: "Expandable action cluster for quick commands.",
    description:
      "Speed Dial groups floating actions and reveals them on interaction.",
    useCases: ["Mobile shortcuts", "Create actions", "Context tools"],
    example: {
      code: `import { SpeedDial } from "@inglorious/ui/speed-dial"

SpeedDial.render({
  isOpen: true,
  actions: [
    { label: "Add", icon: "+" },
    { label: "Share", icon: "↗" }
  ]
})`,
      preview: () =>
        SpeedDial.render({
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
      code: `import { Stepper } from "@inglorious/ui/stepper"

Stepper.render({
  activeStep: 1,
  steps: [
    { label: "Details" },
    { label: "Billing" },
    { label: "Confirm" }
  ]
})`,
      preview: () =>
        Stepper.render({
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
      code: `import { Tabs } from "@inglorious/ui/tabs"

Tabs.render({
  value: 0,
  items: [
    { label: "Overview", panel: "Overview content" },
    { label: "Details", panel: "Details content" }
  ]
})`,
      preview: () =>
        Tabs.render({
          value: 0,
          items: [
            {
              label: "Overview",
              panel: Typography.render({
                variant: "body2",
                children: "Overview content",
              }),
            },
            {
              label: "Details",
              panel: Typography.render({
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
      code: `import { Accordion } from "@inglorious/ui/accordion"

Accordion.render({
  items: [
    { title: "Usage", content: "How to use it", isExpanded: true },
    { title: "API", content: "Props and handlers" }
  ]
})`,
      preview: () =>
        Accordion.render({
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
      code: `import { AppBar } from "@inglorious/ui/app-bar"
import { Button } from "@inglorious/ui/button"

AppBar.render({
  title: "Project Ops",
  subtitle: "SLA dashboard",
  trailing: Button.render({ children: "Share" })
})`,
      preview: () =>
        AppBar.render({
          title: "Project Ops",
          subtitle: "SLA dashboard",
          leading: MaterialIcon.render({ name: "menu" }),
          trailing: Button.render({
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
      code: `import { Card } from "@inglorious/ui/card"

Card.render({
  title: "Weekly report",
  subtitle: "Updated 2h ago",
  children: "View metrics and KPIs"
})`,
      preview: () =>
        Card.render({
          title: "Weekly report",
          subtitle: "Updated 2h ago",
          children: Typography.render({
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
      code: `import { Paper } from "@inglorious/ui/paper"

Paper.render({
  padding: "md",
  children: "Surface content"
})`,
      preview: () =>
        Paper.render({
          padding: "md",
          children: Typography.render({
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
