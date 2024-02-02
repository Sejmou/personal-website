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
  import { pageCount } from './pages';

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
</script>

<svelte:window on:scroll={onScroll} on:mousemove={onMouseMove} />

<main class={`relative pointer-events-none h-[${pageCount}00vh]`}>
  <div class="fixed left-0 top-0 h-[100lvh] w-screen">
    <App />
  </div>
  <div
    class={`relative pointer-events-auto p-6 mx-auto w-full max-w-screen-lg grid grid-cols-1 grid-rows-${pageCount} gap-4 h-full`}
  >
    {#each Array(pageCount) as _, i}
      {#if i === 0}
        <section>
          <h1>Welcome!</h1>
          <p>
            This is my website! It is still a work in progress and I have no
            idea what this will look like later.
          </p>
        </section>
      {:else if i === 1}
        <section>
          <h2>Links</h2>
          <ul class="list-disc list-inside">
            <li><a class="link link-info link-hover" href="/blog">Blog</a></li>
            <li>
              <a class="link link-info link-hover" href="/about">About Me</a>
            </li>
          </ul>
        </section>
      {:else}
        <section class="flex items-center justify-center">
          <h2>Content Page {i}</h2>
        </section>
      {/if}
    {/each}
  </div>
</main>
