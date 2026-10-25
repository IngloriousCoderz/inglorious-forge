import { createMemo } from "solid-js"

const LeafNode = (props) => {
  const snapshot = createMemo(() => props.leafValues[props.leafId])

  return (
    <div class="leaf">
      {props.leafId} v{snapshot().version} val:{snapshot().value}
    </div>
  )
}

export const TreeNode = (props) => {
  if (props.node.children.length === 0) {
    return <LeafNode leafId={props.node.leafId} leafValues={props.leafValues} />
  }

  return (
    <div class="node">
      <div class="node-label">{props.node.id}</div>
      {props.node.children.map((child) => (
        <TreeNode node={child} leafValues={props.leafValues} />
      ))}
    </div>
  )
}
