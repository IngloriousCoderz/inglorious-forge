/**
 * @typedef {import('../../../types/data-display/list').ListEntity} ListEntity
 * @typedef {import('@inglorious/web').Api} Api
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { classMap, html, ref, repeat } from "@inglorious/web"

import { applyElementProps } from "../../shared/applyElementProps.js"

const PRETTY_INDEX = 1

/**
 * @param {ListEntity} entity
 * @param {Api} api
 * @returns {TemplateResult}
 */
export function render(entity, api) {
  const {
    type,
    items = [],
    children,
    ordered = false,
    dense = false,
    divided = false,
    className = "",
    ...rest
  } = entity

  const extraClasses = Object.fromEntries(
    className
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => [name, true]),
  )

  const classes = {
    "iw-list": true,
    "iw-list-ordered": ordered,
    "iw-list-dense": dense,
    "iw-list-divided": divided,
    ...extraClasses,
  }

  const typeWithRenderers = getListType(type, api)
  const content =
    children ??
    repeat(
      items,
      (item, index) => item?.id ?? `${index}`,
      (item, index) =>
        typeWithRenderers.renderItem(entity, { item, index }, api),
    )

  if (ordered) {
    return html`
      <ol
        class=${classMap(classes)}
        ${ref((el) => applyElementProps(el, rest))}
      >
        ${content}
      </ol>
    `
  }

  return html`
    <ul class=${classMap(classes)} ${ref((el) => applyElementProps(el, rest))}>
      ${content}
    </ul>
  `
}

/**
 * @param {ListEntity} _entity
 * @param {{item: unknown, index: number}} payload
 * @returns {TemplateResult}
 */
export function renderItem(_entity, { item, index }) {
  const text =
    item?.label ?? item?.children ?? item ?? `${index + PRETTY_INDEX}`
  return html`<li class="iw-list-item">${text}</li>`
}

function getListType(type, api) {
  const resolved = api?.getType?.(type)

  if (typeof resolved?.renderItem === "function") {
    return resolved
  }

  return { renderItem }
}
