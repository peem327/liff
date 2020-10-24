<template>
  <h3>{{title}}</h3>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TopHeading extends Vue {
  @Prop() private title!: string;
}

</script>

<style scoped>

</style>
