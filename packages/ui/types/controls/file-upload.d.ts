import type { TemplateResult } from "@inglorious/web"

export interface FileUploadProps {
  id?: string
  name?: string
  label?: string
  hint?: string
  error?: string
  accept?: string
  isMultiple?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  isFullWidth?: boolean
  selectedFiles?: string[]
  title?: string
  description?: string
  /** Shown while no file is selected. Defaults to "No file selected". */
  emptyLabel?: string
  onChange?: (files: FileList | null) => void
  onBlur?: () => void
  onFocus?: () => void
  [key: string]: unknown
}

export type FileUploadType = {
  render(props: FileUploadProps): TemplateResult
}

export declare const FileUpload: FileUploadType
