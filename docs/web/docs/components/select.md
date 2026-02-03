---
title: Select Component
description: Single and multi-select dropdown with search and custom rendering
---

# Select Component

Dropdown with single/multi-select, search, and keyboard navigation.

## Basic Setup

```javascript
import { select } from "@inglorious/web/select"
import "@inglorious/web/select/base.css"
import "@inglorious/web/select/theme.css"

const types = {
  select,
}

const entities = {
  countrySelect: {
    type: "select",
    options: [
      { value: "us", label: "United States" },
      { value: "ca", label: "Canada" },
      { value: "uk", label: "United Kingdom" },
    ],
    isSearchable: true,
    placeholder: "Select a country...",
  },
}
```

## Single Select

```javascript
const entities = {
  select: {
    type: "select",
    options: [
      /* ... */
    ],
    isMulti: false, // Single select
    selectedValue: null,
  },
}
```

## Multi Select

```javascript
const entities = {
  select: {
    type: "select",
    options: [
      /* ... */
    ],
    isMulti: true, // Multi select
    selectedValue: [], // Array of selected
  },
}
```

## Configuration

```javascript
{
  type: 'select',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ],
  selectedValue: null,
  isOpen: false,
  isMulti: false, // Single or multi select
  isSearchable: true, // Enable search
  isClearable: true, // Show clear button
  placeholder: 'Select...',
  searchTerm: '',
  isLoading: false,
}
```

## Events

```javascript
// Toggle dropdown
api.notify("#select:toggle")

// Select option
api.notify("#select:optionSelect", "option1")

// Clear selection
api.notify("#select:clear")

// Search
api.notify("#select:search", "search term")
```

## Custom Rendering

```javascript
const customSelect = {
  ...select,

  render(entity, api) {
    // Custom dropdown rendering
    return html`
      <div class="custom-select">
        <!-- custom render -->
      </div>
    `
  },
}
```

**[Full Select Documentation](https://github.com/IngloriousCoderz/inglorious-forge/tree/main/packages/web#select)**
