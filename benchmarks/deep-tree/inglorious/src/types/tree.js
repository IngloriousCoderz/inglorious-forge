import {
  createInitialLeafValues,
  createTreeModel,
  updateLeafValuesMutative,
} from "@benchmarks/deep-tree-shared"
import { html } from "@inglorious/web"

const model = createTreeModel()

export const tree = {
  create(entity) {
    entity.root = model.root
    entity.leafIds = model.leafIds
    entity.leafValues = createInitialLeafValues(model.leafIds)
    entity.totalNodes = model.totalNodes
    entity.totalLeaves = model.totalLeaves
  },

  randomUpdate(entity) {
    updateLeafValuesMutative(entity.leafValues, entity.leafIds)
  },

  render(entity) {
    return html`<div class="tree-container">
      ${renderNodeWithValues(entity.root, entity.leafValues)}
    </div>`
  },
}

const renderNodeWithValues = (node, leafValues) => {
  if (node.children.length === 0) {
    const leaf = leafValues[node.leafId]
    return html`<div class="leaf">
      ${node.leafId} v${leaf.version} val:${leaf.value}
    </div>`
  }

  return html`<div class="node">
    <div class="node-label">${node.id}</div>
    ${node.children.map((child) => renderNodeWithValues(child, leafValues))}
  </div>`
}
