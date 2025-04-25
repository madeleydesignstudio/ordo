<script lang="ts">
  import { onMount } from 'svelte';

  // Define a prop with a TypeScript type and a default value
  export let message: string = 'Hello from BasicComponent!';

  // You can add more TypeScript logic here if needed
  let count: number = 0;

  // Variable to hold the DOM element reference
  let domElementRef: HTMLDivElement;

  function increment() {
    count += 1;
    // Also manipulate the DOM element directly on increment
    if (domElementRef) {
      domElementRef.textContent = `Button clicked ${count} times! (Direct DOM manipulation)`;
      domElementRef.style.color = 'blue';
    }
  }

  onMount(() => {
    console.log('BasicComponent mounted!');
    // Access the DOM element directly after mount
    if (domElementRef) {
      console.log('Accessing bound DOM element:', domElementRef);
      domElementRef.textContent = 'Content set directly via DOM API onMount';
      domElementRef.style.fontWeight = 'bold';
    }
  });

</script>

<div class="basic-component">
  <h2>Basic Svelte Component (with TypeScript)</h2>
  <p>{message}</p>
  <button on:click={increment}>Clicked {count} {count === 1 ? 'time' : 'times'}</button>

  <div bind:this={domElementRef} class="dom-manipulation-target">
    Initial content, will be replaced by DOM manipulation.
  </div>
</div>

<style>
  .basic-component {
    border: 1px solid #ccc;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
  }
  h2 {
    color: #ff3e00; /* Svelte orange */
  }
  button {
    padding: 0.5rem 1rem;
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #cf3300;
  }
  .dom-manipulation-target {
    margin-top: 1rem;
    padding: 0.5rem;
    border: 1px dashed blue;
    color: initial; /* Start with default color */
    font-weight: normal; /* Start with normal weight */
  }
</style> 