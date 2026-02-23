/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from "vitest"

import {
  filterOptions,
  findOptionIndex,
  formatOption,
  getOptionLabel,
  getOptionValue,
  groupOptions,
  isOptionSelected,
  select,
} from "."

const sampleOptions = [
  { value: "br", label: "Brazil" },
  { value: "it", label: "Italy" },
  { value: "ca", label: "Canada" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "fr", label: "France" },
]

describe("select", () => {
  let entity

  beforeEach(() => {
    entity = {
      id: "test-select",
      type: "select",
      options: JSON.parse(JSON.stringify(sampleOptions)),
    }
  })

  describe("logic", () => {
    describe("create()", () => {
      it("should initialize with default state", () => {
        select.create(entity)

        expect(entity.isOpen).toBe(false)
        expect(entity.searchTerm).toBe("")
        expect(entity.focusedIndex).toBe(-1)
        expect(entity.isMulti).toBe(false)
        expect(entity.selectedValue).toBe(null)
        expect(entity.options).toEqual(sampleOptions)
        expect(entity.isLoading).toBe(false)
        expect(entity.isDisabled).toBe(false)
        expect(entity.isSearchable).toBe(true)
        expect(entity.isClearable).toBe(true)
        expect(entity.isCreatable).toBe(false)
        expect(entity.placeholder).toBe("Select...")
        expect(entity.noOptionsMessage).toBe("No options")
        expect(entity.loadingMessage).toBe("Loading...")
        expect(entity.groupBy).toBe(null)
      })

      it("should initialize multi-select with empty array", () => {
        entity.isMulti = true
        select.create(entity)
        expect(entity.selectedValue).toEqual([])
      })
    })

    describe("open() and close()", () => {
      beforeEach(() => {
        select.create(entity)
      })

      it("open: should open the dropdown", () => {
        select.open(entity)
        expect(entity.isOpen).toBe(true)
      })

      it("open: should not open if disabled", () => {
        entity.isDisabled = true
        select.open(entity)
        expect(entity.isOpen).toBe(false)
      })

      it("open: should focus first option if available", () => {
        select.open(entity)
        expect(entity.focusedIndex).toBe(0)
      })

      it("open: should not focus if no options", () => {
        entity.options = []
        select.open(entity)
        expect(entity.focusedIndex).toBe(-1)
      })

      it("close: should close the dropdown", () => {
        entity.isOpen = true
        entity.focusedIndex = 2
        select.close(entity)
        expect(entity.isOpen).toBe(false)
        expect(entity.focusedIndex).toBe(-1)
      })
    })

    describe("toggle()", () => {
      beforeEach(() => {
        select.create(entity)
      })

      it("should open if closed", () => {
        select.toggle(entity)
        expect(entity.isOpen).toBe(true)
      })

      it("should close if open", () => {
        entity.isOpen = true
        select.toggle(entity)
        expect(entity.isOpen).toBe(false)
      })
    })

    describe("optionSelect()", () => {
      beforeEach(() => {
        select.create(entity)
      })

      it("should select an option in single-select mode", () => {
        const option = sampleOptions[0]
        select.optionSelect(entity, option)
        expect(entity.selectedValue).toBe("br")
        expect(entity.isOpen).toBe(false)
      })

      it("should add option in multi-select mode", () => {
        entity.isMulti = true
        select.create(entity)
        entity.isOpen = true // Open dropdown first
        const option = sampleOptions[0]
        select.optionSelect(entity, option)
        expect(entity.selectedValue).toContain("br")
        expect(entity.isOpen).toBe(true) // Multi-select doesn't close
      })

      it("should remove option in multi-select mode if already selected", () => {
        entity.isMulti = true
        select.create(entity)
        const option = sampleOptions[0]
        select.optionSelect(entity, option) // Add
        select.optionSelect(entity, option) // Remove
        expect(entity.selectedValue).not.toContain("br")
      })

      it("should not select if disabled", () => {
        entity.isDisabled = true
        select.optionSelect(entity, sampleOptions[0])
        expect(entity.selectedValue).toBe(null)
      })
    })

    describe("clear()", () => {
      beforeEach(() => {
        select.create(entity)
      })

      it("should clear selection in single-select mode", () => {
        entity.selectedValue = "br"
        select.clear(entity)
        expect(entity.selectedValue).toBe(null)
      })

      it("should clear selection in multi-select mode", () => {
        entity.isMulti = true
        select.create(entity)
        entity.selectedValue = ["br", "us"]
        select.clear(entity)
        expect(entity.selectedValue).toEqual([])
      })

      it("should not clear if disabled", () => {
        entity.selectedValue = "br"
        entity.isDisabled = true
        select.clear(entity)
        expect(entity.selectedValue).toBe("br")
      })
    })

    describe("searchChange()", () => {
      beforeEach(() => {
        select.create(entity)
      })

      it("should update searchTerm and filter options", () => {
        select.searchChange(entity, "bra")
        expect(entity.searchTerm).toBe("bra")
      })

      it("should reset focusedIndex when search changes", () => {
        entity.focusedIndex = 2
        select.searchChange(entity, "bra")
        expect(entity.focusedIndex).toBe(0)
      })

      it("should set focusedIndex to -1 if no results", () => {
        select.searchChange(entity, "xyz")
        expect(entity.focusedIndex).toBe(-1)
      })

      it("should show all options if searchTerm is empty", () => {
        select.searchChange(entity, "bra")
        select.searchChange(entity, "")
        expect(entity.focusedIndex).toBe(0)
      })
    })

    describe("keyboard navigation", () => {
      beforeEach(() => {
        select.create(entity)
      })

      it("focusNext: should move to next option", () => {
        entity.focusedIndex = 0
        select.focusNext(entity)
        expect(entity.focusedIndex).toBe(1)
      })

      it("focusNext: should not go past last option", () => {
        entity.focusedIndex = sampleOptions.length - 1
        select.focusNext(entity)
        expect(entity.focusedIndex).toBe(sampleOptions.length - 1)
      })

      it("focusPrev: should move to previous option", () => {
        entity.focusedIndex = 2
        select.focusPrev(entity)
        expect(entity.focusedIndex).toBe(1)
      })

      it("focusPrev: should not go before first option", () => {
        entity.focusedIndex = 0
        select.focusPrev(entity)
        expect(entity.focusedIndex).toBe(-1)
      })

      it("focusFirst: should move to first option", () => {
        entity.focusedIndex = 3
        select.focusFirst(entity)
        expect(entity.focusedIndex).toBe(0)
      })

      it("focusLast: should move to last option", () => {
        entity.focusedIndex = 0
        select.focusLast(entity)
        expect(entity.focusedIndex).toBe(sampleOptions.length - 1)
      })

      it("focusNext: should not move if no options", () => {
        entity.options = []
        entity.focusedIndex = -1
        select.focusNext(entity)
        expect(entity.focusedIndex).toBe(-1)
      })
    })
  })

  describe("helpers", () => {
    describe("getOptionValue()", () => {
      it("should return value from object", () => {
        expect(getOptionValue({ value: "test", label: "Test" })).toBe("test")
      })

      it("should return the option itself if not an object", () => {
        expect(getOptionValue("test")).toBe("test")
        expect(getOptionValue(123)).toBe(123)
      })

      it("should return the object itself if it has no value property", () => {
        const option = { label: "Test" }
        expect(getOptionValue(option)).toBe(option)
      })
    })

    describe("getOptionLabel()", () => {
      it("should return label from object", () => {
        expect(getOptionLabel({ value: "test", label: "Test" })).toBe("Test")
      })

      it("should return value as string if no label", () => {
        expect(getOptionLabel({ value: "test" })).toBe("test")
      })

      it("should return stringified option if not an object", () => {
        expect(getOptionLabel("test")).toBe("test")
        expect(getOptionLabel(123)).toBe("123")
      })
    })

    describe("isOptionSelected()", () => {
      it("should return true for selected option in single-select", () => {
        const option = { value: "br", label: "Brazil" }
        expect(isOptionSelected(option, "br", false)).toBe(true)
        expect(isOptionSelected(option, "us", false)).toBe(false)
      })

      it("should return true for selected option in multi-select", () => {
        const option = { value: "br", label: "Brazil" }
        expect(isOptionSelected(option, ["br", "us"], true)).toBe(true)
        expect(isOptionSelected(option, ["us"], true)).toBe(false)
      })

      it("should handle string/number options", () => {
        expect(isOptionSelected("test", "test", false)).toBe(true)
        expect(isOptionSelected(123, 123, false)).toBe(true)
      })
    })

    describe("filterOptions()", () => {
      it("should return all options if searchTerm is empty", () => {
        const result = filterOptions(sampleOptions, "")
        expect(result).toEqual(sampleOptions)
      })

      it("should filter options by label (case-insensitive)", () => {
        const result = filterOptions(sampleOptions, "bra")
        expect(result).toHaveLength(1)
        expect(result[0].label).toBe("Brazil")
      })

      it("should filter options case-insensitively", () => {
        const result = filterOptions(sampleOptions, "BRA")
        expect(result).toHaveLength(1)
        expect(result[0].label).toBe("Brazil")
      })

      it("should return empty array if no matches", () => {
        const result = filterOptions(sampleOptions, "xyz")
        expect(result).toHaveLength(0)
      })

      it("should trim searchTerm", () => {
        const result = filterOptions(sampleOptions, "  bra  ")
        expect(result).toHaveLength(1)
      })
    })

    describe("findOptionIndex()", () => {
      it("should find index of option by value", () => {
        expect(findOptionIndex(sampleOptions, "br")).toBe(0)
        expect(findOptionIndex(sampleOptions, "it")).toBe(1)
      })

      it("should return -1 if not found", () => {
        expect(findOptionIndex(sampleOptions, "xyz")).toBe(-1)
      })
    })

    describe("groupOptions()", () => {
      const groupedOptions = [
        { value: "a", label: "A", category: "letters" },
        { value: "b", label: "B", category: "letters" },
        { value: "1", label: "1", category: "numbers" },
        { value: "2", label: "2", category: "numbers" },
      ]

      it("should group options by property", () => {
        const result = groupOptions(groupedOptions, "category")
        expect(result).toHaveLength(2)
        expect(result[0].label).toBe("letters")
        expect(result[0].options).toHaveLength(2)
        expect(result[1].label).toBe("numbers")
        expect(result[1].options).toHaveLength(2)
      })

      it("should return null if groupBy is not provided", () => {
        expect(groupOptions(sampleOptions, null)).toBeNull()
        expect(groupOptions(sampleOptions, "")).toBeNull()
      })

      it("should handle options without group property", () => {
        const mixedOptions = [
          ...groupedOptions,
          { value: "x", label: "X" }, // No category
        ]
        const result = groupOptions(mixedOptions, "category")
        expect(result).toBeDefined()
        const ungrouped = result.find((g) => g.label === "Ungrouped")
        expect(ungrouped).toBeDefined()
        expect(ungrouped.options).toContainEqual({ value: "x", label: "X" })
      })
    })

    describe("formatOption()", () => {
      it("should format string as option", () => {
        const result = formatOption("test")
        expect(result).toEqual({ value: "test", label: "test" })
      })

      it("should format number as option", () => {
        const result = formatOption(123)
        expect(result).toEqual({ value: 123, label: "123" })
      })

      it("should preserve object option", () => {
        const option = { value: "test", label: "Test", disabled: true }
        const result = formatOption(option)
        expect(result).toEqual({
          value: "test",
          label: "Test",
          disabled: true,
        })
      })

      it("should create label from value if missing", () => {
        const result = formatOption({ value: "test" })
        expect(result).toEqual({ value: "test", label: "test" })
      })
    })
  })
})
