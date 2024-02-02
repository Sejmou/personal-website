import Welcome from './Welcome.svelte';
import Links from './Links.svelte';
import { derived, readable } from 'svelte/store';

export const items = readable([Welcome, Links]);
export const contentItemCount = derived(items, $items => $items.length);
