<script lang="ts">
  import { items } from './content';
</script>

{#each $items as item}
  <section>
    <svelte:component this={item} />
  </section>
{/each}
