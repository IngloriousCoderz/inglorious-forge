import { VirtualList } from "@inglorious/ui/virtual-list"
import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"

import classes from "./product-list.module.css"

const DIVISOR = 2

export const ProductList = {
  ...VirtualList,

  renderItem(_, { item, index }) {
    return html`<div
      class=${classMap({
        [classes.product]: true,
        [classes.even]: index % DIVISOR,
      })}
    >
      <strong>Name: ${item.name}</strong>
      <div>Price: ${item.price}</div>
    </div>`
  },
}
