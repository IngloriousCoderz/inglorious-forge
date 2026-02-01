<template>
  <span @click="click"
    >Hello
    {{ entity.isUpperCase ? entity.who.toUpperCase() : entity.who }}</span
  >
</template>

<script>
const click = (entity) => (entity.isUpperCase = !entity.isUpperCase)
</script>
