<script>
  export let leafId
  export let leafStore
</script>

<div class="leaf">
  {leafId} v{$leafStore.version} val:{$leafStore.value}
</div>
