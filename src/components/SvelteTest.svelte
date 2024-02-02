<script lang="ts">
  import { writable } from 'svelte/store';

  const count = writable(0);

  function increment() {
    count.update(n => n + 1);
  }
</script>

<div>
  <h2>Svelte Counter</h2>
  <p>Current count: {$count}</p>
  <button on:click={increment}>Increment</button>
</div>

<a class="link link-info link-hover" href="/blog">My Blog</a>
