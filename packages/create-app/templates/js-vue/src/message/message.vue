<template>
  <span @click="click">Hello ${message}</span>
</template>

<script>
const click = (entity) => (entity.isUpperCase = !entity.isUpperCase)
</script>
