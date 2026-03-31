import type { TemplateResult } from "@inglorious/web"

export interface AccordionItem {
  id?: string | number
  title: TemplateResult | string | number
  content?: TemplateResult | string | number
  icon?: TemplateResult | string | number
  isExpanded?: boolean
  isDisabled?: boolean
  onToggle?: (item: AccordionItem, index: number, expanded: boolean) => void
  [key: string]: unknown
}

export interface AccordionProps {
  id?: string
  type?: string
  className?: string
  items?: AccordionItem[]
  onItemToggle?: (item: AccordionItem, index: number, expanded: boolean) => void
  [key: string]: unknown
}

export interface AccordionType {
  render(props: AccordionProps): TemplateResult
  renderAccordion(props: AccordionProps): TemplateResult
  renderItem(
    item: AccordionItem,
    index: number,
    props: AccordionProps,
  ): TemplateResult
}

export declare const Accordion: AccordionType
