import type { TemplateResult } from "@inglorious/web"

export interface FileUploadProps {
  id?: string
  name?: string
  label?: string
  hint?: string
  error?: string
  accept?: string
  multiple?: boolean
  isDisabled?: boolean
  isRequired?: boolean
  isFullWidth?: boolean
  selectedFiles?: string[]
  title?: string
  description?: string
  onChange?: (files: FileList | null) => void
  onBlur?: () => void
  onFocus?: () => void
  [key: string]: unknown
}

export interface FileUploadType {
  render(props: FileUploadProps): TemplateResult
}

export declare const FileUpload: FileUploadType
