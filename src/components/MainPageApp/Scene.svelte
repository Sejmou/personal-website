<script>
  import { T, useTask } from '@threlte/core';
  import { springScrollPos } from './page-interaction';
  import { pageCount } from './pages';

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

<T.Mesh rotation.y={rotation} position.y={0.5} castShadow>
  <T.BoxGeometry args={[1, pageCount - $springScrollPos, 1]} />
  <T.MeshStandardMaterial color="hotpink" />
</T.Mesh>

<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.CircleGeometry args={[4, 40]} />
  <T.MeshStandardMaterial color="white" />
</T.Mesh>
