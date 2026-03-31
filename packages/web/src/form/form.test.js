/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

import { Form, getFieldError, getFieldValue, isFieldTouched } from "."

describe("form", () => {
  let entity

  beforeEach(() => {
    entity = {
      id: "test-form",
      initialValues: {
        name: "John Doe",
        contact: {
          email: "john.doe@example.com",
        },
        tags: ["a", "b"],
      },
    }
  })

  describe("init()", () => {
    it("should add global event listeners for click and submit", () => {
      const spy = vi.spyOn(document, "addEventListener")
      Form.init(entity)
      expect(spy).toHaveBeenCalledWith("click", expect.any(Function))
      expect(spy).toHaveBeenCalledWith("submit", expect.any(Function))
      spy.mockRestore()
    })
  })

  describe("create()", () => {
    it("should initialize the form", () => {
      entity.values = {}
      Form.create(entity)
      expect(entity.values).toEqual(entity.initialValues)
    })

    it("should reset the form to its initial state", () => {
      // mess up the state first
      entity.values = {}
      entity.isPristine = false

      Form.create(entity)

      expect(entity.values).toEqual(entity.initialValues)
      expect(entity.values).not.toBe(entity.initialValues) // should be a clone
      expect(entity.isPristine).toBe(true)
      expect(entity.isValid).toBe(true)
      expect(entity.errors).toEqual({
        name: null,
        contact: { email: null },
        tags: [null, null],
      })
      expect(entity.touched).toEqual({
        name: null,
        contact: { email: null },
        tags: [null, null],
      })
    })
  })

  describe("reset()", () => {
    it("should reset the form to its initial state", () => {
      Form.create(entity)
      entity.values.name = "Jane Doe"
      entity.isPristine = false

      Form.reset(entity)

      expect(entity.values).toEqual(entity.initialValues)
      expect(entity.isPristine).toBe(true)
    })
  })

  describe("fieldChange()", () => {
    beforeEach(() => {
      Form.create(entity)
    })

    it("should update a field's value, mark it as touched, and set form to dirty", () => {
      Form.fieldChange(entity, { path: "name", value: "Jane Doe" })

      expect(entity.values.name).toBe("Jane Doe")
      expect(entity.touched.name).toBe(true)
      expect(entity.isPristine).toBe(false)
    })

    it("should update a nested field's value", () => {
      Form.fieldChange(entity, {
        path: "contact.email",
        value: "jane.doe@example.com",
      })

      expect(entity.values.contact.email).toBe("jane.doe@example.com")
      expect(entity.touched.contact.email).toBe(true)
    })

    it("should validate the field if a validate function is provided", () => {
      const validate = (value) => (value.length < 10 ? "Too short" : null)
      Form.fieldChange(entity, { path: "name", value: "Jane", validate })

      expect(entity.errors.name).toBe("Too short")
      expect(entity.isValid).toBe(false)
    })

    it("should clear a field's error when it becomes valid", () => {
      const validate = (value) => (value.length < 10 ? "Too short" : null)
      Form.fieldChange(entity, { path: "name", value: "Jane", validate })
      expect(entity.isValid).toBe(false)

      Form.fieldChange(entity, {
        path: "name",
        value: "Jane Doe The Great",
        validate,
      })

      expect(entity.errors.name).toBe(null)
      expect(entity.isValid).toBe(true)
    })
  })

  describe("fieldBlur()", () => {
    beforeEach(() => {
      Form.create(entity)
    })

    it("should mark a field as touched", () => {
      Form.fieldBlur(entity, { path: "name" })
      expect(entity.touched.name).toBe(true)
    })

    it("should validate the field if a validate function is provided", () => {
      const validate = (value) =>
        value === "John Doe" ? "Cannot be John" : null
      Form.fieldBlur(entity, { path: "name", validate })

      expect(entity.errors.name).toBe("Cannot be John")
      expect(entity.isValid).toBe(false)
    })
  })

  describe("field array operations", () => {
    beforeEach(() => {
      Form.create(entity)
    })

    it("fieldArrayAppend: should append a value and metadata", () => {
      Form.fieldArrayAppend(entity, { path: "tags", value: "c" })

      expect(entity.values.tags).toEqual(["a", "b", "c"])
      expect(entity.errors.tags).toEqual([null, null, null])
      expect(entity.touched.tags).toEqual([null, null, null])
      expect(entity.isPristine).toBe(false)
    })

    it("fieldArrayRemove: should remove a value and metadata at an index", () => {
      Form.fieldArrayRemove(entity, { path: "tags", index: 0 })

      expect(entity.values.tags).toEqual(["b"])
      expect(entity.errors.tags).toEqual([null])
      expect(entity.touched.tags).toEqual([null])
      expect(entity.isPristine).toBe(false)
    })

    it("fieldArrayInsert: should insert a value and metadata at an index", () => {
      Form.fieldArrayInsert(entity, { path: "tags", index: 1, value: "c" })

      expect(entity.values.tags).toEqual(["a", "c", "b"])
      expect(entity.errors.tags).toEqual([null, null, null])
      expect(entity.touched.tags).toEqual([null, null, null])
      expect(entity.isPristine).toBe(false)
    })

    it("fieldArrayMove: should move a value and metadata", () => {
      entity.errors.tags[0] = "Error on A"
      entity.touched.tags[0] = true

      Form.fieldArrayMove(entity, { path: "tags", fromIndex: 0, toIndex: 1 })

      expect(entity.values.tags).toEqual(["b", "a"])
      expect(entity.errors.tags).toEqual([null, "Error on A"])
      expect(entity.touched.tags).toEqual([null, true])
      expect(entity.isPristine).toBe(false)
    })

    it("fieldArray operations should warn if path is not an array", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {})

      Form.fieldArrayAppend(entity, { path: "name", value: "c" })
      expect(spy).toHaveBeenCalledWith("Field at path 'name' is not an array")

      spy.mockRestore()
    })
  })

  describe("validate()", () => {
    beforeEach(() => {
      Form.create(entity)
    })

    it("should set errors and isValid based on the validation function", () => {
      const validate = (values) => {
        const errors = {}
        if (values.name !== "Jane Doe") {
          errors.name = "Name must be Jane Doe"
        }
        return errors
      }

      Form.validate(entity, { validate })

      expect(entity.errors.name).toBe("Name must be Jane Doe")
      expect(entity.isValid).toBe(false)
    })

    it("should set isValid to true if there are no errors", () => {
      const validate = () => ({})

      entity.isValid = false
      Form.validate(entity, { validate })

      expect(entity.errors).toEqual({})
      expect(entity.isValid).toBe(true)
    })
  })

  describe("validateAsync()", () => {
    let api

    beforeEach(() => {
      Form.create(entity)
      api = { notify: vi.fn() }
    })

    it("should set isValidating to true and call the validation function", async () => {
      const validate = vi.fn().mockResolvedValue({})
      await Form.validateAsync(entity, { validate }, api)
      expect(entity.isValidating).toBe(true)
      expect(validate).toHaveBeenCalledWith(entity.values)
    })

    it("should notify 'validationComplete' on successful validation", async () => {
      const errors = { name: "Required" }
      const validate = async () => errors
      await Form.validateAsync(entity, { validate }, api)

      expect(api.notify).toHaveBeenCalledWith(
        `#${entity.id}:validationComplete`,
        {
          errors,
          isValid: false,
        },
      )
    })

    it("should notify 'validationError' on validation failure", async () => {
      const error = new Error("Validation failed")
      const validate = async () => {
        throw error
      }
      await Form.validateAsync(entity, { validate }, api)

      expect(api.notify).toHaveBeenCalledWith(`#${entity.id}:validationError`, {
        error: "Validation failed",
      })
    })
  })

  describe("validationComplete()", () => {
    it("should update form state after async validation", () => {
      Form.create(entity)
      entity.isValidating = true
      const errors = { name: "Error" }

      Form.validationComplete(entity, { errors, isValid: false })

      expect(entity.isValidating).toBe(false)
      expect(entity.errors).toBe(errors)
      expect(entity.isValid).toBe(false)
    })
  })

  describe("validationError()", () => {
    it("should update form state after an async validation error", () => {
      Form.create(entity)
      entity.isValidating = true

      Form.validationError(entity, { error: "Network Error" })

      expect(entity.isValidating).toBe(false)
      expect(entity.submitError).toBe("Network Error")
    })
  })
})

describe("form helpers", () => {
  let testForm

  beforeEach(() => {
    testForm = {
      values: {
        user: { name: "Alex" },
        tags: ["one", "two"],
      },
      errors: {
        user: { name: "Too short" },
        tags: [null, "Invalid tag"],
      },
      touched: {
        user: { name: true },
        tags: [true, false],
      },
    }
  })

  describe("getFieldValue()", () => {
    it("should return the value of a field at a given path", () => {
      expect(getFieldValue(testForm, "user.name")).toBe("Alex")
    })

    it("should return an array value", () => {
      expect(getFieldValue(testForm, "tags")).toEqual(["one", "two"])
    })

    it("should return a default value if path does not exist", () => {
      expect(getFieldValue(testForm, "user.age", 30)).toBe(30)
    })

    it("should return undefined if path does not exist and no default is provided", () => {
      expect(getFieldValue(testForm, "user.age")).toBeUndefined()
    })
  })

  describe("getFieldError()", () => {
    it("should return the error of a field at a given path", () => {
      expect(getFieldError(testForm, "user.name")).toBe("Too short")
    })

    it("should return the error of a field in an array", () => {
      expect(getFieldError(testForm, "tags.1")).toBe("Invalid tag")
    })

    it("should return null for a valid field in an array", () => {
      expect(getFieldError(testForm, "tags.0")).toBeNull()
    })

    it("should return undefined if path does not exist", () => {
      expect(getFieldError(testForm, "user.age")).toBe(undefined)
    })
  })

  describe("isFieldTouched()", () => {
    it("should return true if a field has been touched", () => {
      expect(isFieldTouched(testForm, "user.name")).toBe(true)
    })

    it("should return true for a touched field in an array", () => {
      expect(isFieldTouched(testForm, "tags.0")).toBe(true)
    })

    it("should return false for an untouched field in an array", () => {
      expect(isFieldTouched(testForm, "tags.1")).toBe(false)
    })

    it("should return false if path does not exist", () => {
      expect(isFieldTouched(testForm, "user.age")).toBe(false)
    })
  })
})
