import fs from "node:fs/promises"
import path from "node:path"

import { afterEach, describe, expect, it, vi } from "vitest"

import { copyPublicDir } from "./public"

const mockAccess = vi.hoisted(() => vi.fn())
const mockReaddir = vi.hoisted(() => vi.fn())
const mockMkdir = vi.hoisted(() => vi.fn())
const mockCopyFile = vi.hoisted(() => vi.fn())

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    access: mockAccess,
    readdir: mockReaddir,
    mkdir: mockMkdir,
    copyFile: mockCopyFile,
    default: {
      ...actual.default,
      access: mockAccess,
      readdir: mockReaddir,
      mkdir: mockMkdir,
      copyFile: mockCopyFile,
    },
  }
})

describe("copyPublicDir", () => {
  const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should copy public assets when directory exists", async () => {
    // Mock access to succeed
    fs.access.mockResolvedValue(undefined)

    // Mock readdir sequence:
    // 1. Root directory contains 'favicon.ico' (file) and 'assets' (dir)
    // 2. 'assets' directory contains 'logo.png' (file)
    fs.readdir
      .mockResolvedValueOnce([
        { name: "favicon.ico", isDirectory: () => false },
        { name: "assets", isDirectory: () => true },
      ])
      .mockResolvedValueOnce([{ name: "logo.png", isDirectory: () => false }])

    await copyPublicDir({ outDir: "dist", publicDir: "public" })

    // Verify mkdir calls (root dest + subfolder)
    expect(fs.mkdir).toHaveBeenCalledTimes(2)
    expect(fs.mkdir).toHaveBeenCalledWith("dist", { recursive: true })
    expect(fs.mkdir).toHaveBeenCalledWith(expect.stringContaining("assets"), {
      recursive: true,
    })

    // Verify copyFile calls
    expect(fs.copyFile).toHaveBeenCalledTimes(2)
    // We can't easily check exact paths without mocking process.cwd() or doing complex string matching,
    // but we can check that it was called for the files we defined.
    const copyCalls = fs.copyFile.mock.calls
    const filesCopied = copyCalls.map((call) => path.basename(call[0]))
    expect(filesCopied).toContain("favicon.ico")
    expect(filesCopied).toContain("logo.png")
  })

  it("should do nothing if public directory does not exist", async () => {
    fs.access.mockRejectedValue(new Error("ENOENT"))

    await copyPublicDir()

    expect(consoleSpy).not.toHaveBeenCalled()
    expect(fs.readdir).not.toHaveBeenCalled()
    expect(fs.copyFile).not.toHaveBeenCalled()
  })
})
