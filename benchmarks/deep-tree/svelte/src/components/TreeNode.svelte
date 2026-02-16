<script>
  import LeafNode from "./LeafNode.svelte"

  export let node
  export let leafStores
</script>

{#if node.children.length === 0}
  <LeafNode leafId={node.leafId} leafStore={leafStores.get(node.leafId)} />
{:else}
  <div class="node">
    <div class="node-label">{node.id}</div>
    {#each node.children as child (child.id)}
      <svelte:self node={child} {leafStores} />
    {/each}
  </div>
{/if}
