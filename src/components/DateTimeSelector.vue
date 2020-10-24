<template>
  <h3>{{title}}</h3>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

@Component
export default class DateTimeSelector extends Vue {
  //@Prop() private title!: string;
}

</script>

<style scoped>

</style>
