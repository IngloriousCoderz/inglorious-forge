<script>
import { Message } from "./message/index.vue"
</script>

<template>
  <h1>
    <Message v-bind="message1" />, <Message v-bind="message2" />,
    <Message v-bind="message3" />!
  </h1>
</template>
