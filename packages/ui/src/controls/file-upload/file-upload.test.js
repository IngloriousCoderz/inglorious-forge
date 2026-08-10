import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { FileUpload } from "."

describe("file upload", () => {
  describe("render", () => {
    it("renders label and browse button", () => {
      const props = { name: "attachment", label: "Attachment" }
      const container = document.createElement("div")

      render(FileUpload.render(props), container)

      const labelElement = container.querySelector("label")
      const inputElement = container.querySelector("input[type='file']")
      expect(labelElement.textContent.trim()).toContain("Attachment")
      expect(inputElement.name).toBe("attachment")
    })

    it("shows selected file names and error state", () => {
      const props = {
        selectedFiles: ["report.pdf", "summary.csv"],
        error: "One file is too large",
      }
      const container = document.createElement("div")

      render(FileUpload.render(props), container)

      expect(
        container.querySelector(".iw-upload-field-summary").textContent,
      ).toContain("report.pdf")
      expect(
        container.querySelector(".iw-upload-error-message").textContent,
      ).toBe("One file is too large")
    })

    it("dispatches file change event", () => {
      let changedFiles = null
      const props = {
        onChange: (files) => (changedFiles = files),
      }
      const container = document.createElement("div")

      render(FileUpload.render(props), container)

      const inputElement = container.querySelector("input[type='file']")
      const file = new File(["hello"], "hello.txt", { type: "text/plain" })
      const fileList = {
        0: file,
        length: 1,
        item: (index) => (index === 0 ? file : null),
      }
      Object.defineProperty(inputElement, "files", {
        value: fileList,
        configurable: true,
      })

      inputElement.dispatchEvent(new Event("change"))

      expect(changedFiles).not.toBeNull()
      expect(changedFiles[0].name).toBe("hello.txt")
    })
  })
})
