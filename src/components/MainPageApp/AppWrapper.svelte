<script lang="ts">
  import { onMount } from 'svelte';
  import {
    _springScrollPos,
    mouseCoords,
    mouseCoordsSpring,
    scrollPos,
    springScrollPos,
  } from './page-interaction';
  import App from './App.svelte';
  import Content from './Content/Content.svelte';
  import { contentItemCount } from './Content/content';

  const onScroll = () => {
    // get normalized scroll position in document. 0 should equal top of page, 1
    // should equal 1 page height from top, 2 should equal 2 page heights from
    // top, etc. This allows easier addition of content to the bottom as opposed
    // to a normalized scroll position where 1 is the bottom of the page.
    const newScrollPos = Math.max(window.scrollY / window.innerHeight, 0);
    scrollPos.set(newScrollPos);
    _springScrollPos.set(newScrollPos);
  };

  onMount(() => {
    const newScrollPos = Math.max(window.scrollY / window.innerHeight, 0);
    scrollPos.set(newScrollPos);
    _springScrollPos.set(newScrollPos, {
      hard: true,
    });
  });

  const onMouseMove = (e: MouseEvent) => {
    // get normalized mouse coords
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    mouseCoords.set({ x, y });
    mouseCoordsSpring.set({ x, y });
  };

  // mouseCoords.subscribe(coords => {
  //   console.log('mouseCoords', coords);
  // });

  // mouseCoordsSpring.subscribe(coords => {
  //   console.log('mouseCoordsSpring', coords);
  // });

  // scrollPos.subscribe(pos => {
  //   console.log('scrollPos', pos);
  // });

  // springScrollPos.subscribe(pos => {
  //   console.log('springScrollPos', pos);
  // });

  $: count = $contentItemCount;
</script>

<svelte:window on:scroll={onScroll} on:mousemove={onMouseMove} />

<div class={`relative pointer-events-none h-[${count}00vh]`}>
  <div class="fixed left-0 top-0 h-[100lvh] w-screen">
    <App />
  </div>
  <main
    class={`relative pointer-events-auto p-6 mx-auto w-full max-w-screen-lg grid grid-cols-1 grid-rows-${count} gap-4 h-full`}
  >
    <Content />
  </main>
</div>
