<script>
  import { T, useTask } from '@threlte/core';
  import Laptop from './models/laptop.svelte';

  let rotation = 0;
  useTask(delta => {
    rotation += delta * 0.5;
  });
</script>

<T.PerspectiveCamera
  makeDefault
  position={[10, 10, 10]}
  on:create={({ ref }) => {
    ref.lookAt(0, 1, 0);
  }}
/>

<T.DirectionalLight position={[0, 10, 10]} castShadow />

<Laptop position={[0, 0, 0]} />
