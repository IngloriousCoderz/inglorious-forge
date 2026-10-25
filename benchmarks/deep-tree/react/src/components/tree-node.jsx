import { memo, useSyncExternalStore } from "react"

const LeafNode = memo(({ leafId, leafStore }) => {
  const snapshot = useSyncExternalStore(
    (onStoreChange) => leafStore.subscribe(leafId, onStoreChange),
    () => leafStore.get(leafId),
  )

  return (
    <div className="leaf">
      {leafId} v{snapshot.version} val:{snapshot.value}
    </div>
  )
})

LeafNode.displayName = "LeafNode"

export const TreeNode = memo(({ node, leafStore }) => {
  if (node.children.length === 0) {
    return <LeafNode leafId={node.leafId} leafStore={leafStore} />
  }

  return (
    <div className="node">
      <div className="node-label">{node.id}</div>
      {node.children.map((child) => (
        <TreeNode key={child.id} node={child} leafStore={leafStore} />
      ))}
    </div>
  )
})

TreeNode.displayName = "TreeNode"
