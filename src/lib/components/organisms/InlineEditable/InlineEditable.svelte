<!--
  ORGANISM · InlineEditable
  Editing without an edit button. The second inhabitant of the glass layer:
  the same material as the bar, only small — interaction sits in front, the
  text stays where it is.

    Enter commits · Esc discards · clicking away commits as well.

  Nothing jumps: the input and the text share font size, line height and
  position.
-->
<script lang="ts">
  import GlassPen from "../../molecules/GlassPen/GlassPen.svelte";

  interface Props {
    value: string;
    /** Accessible name of the field, e.g. "Company name". */
    label: string;
    multiline?: boolean;
    placeholder?: string;
    onsave?: (value: string) => void;
  }

  let {
    value = $bindable(),
    label,
    multiline = false,
    placeholder = "",
    onsave,
  }: Props = $props();

  let editing = $state(false);
  let hovered = $state(false);
  let draft = $state("");
  let confirmed = $state(false);
  let field = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);
  let confirmTimer: ReturnType<typeof setTimeout> | undefined;

  function start() {
    draft = value;
    editing = true;
  }

  $effect(() => {
    if (editing && field) {
      field.focus();
      field.select();
    }
  });

  function commit() {
    if (!editing) return;
    editing = false;
    const next = draft.trim();
    if (next === value) return;
    value = next;
    onsave?.(next);

    // A short confirmation on the element itself instead of a save dialog.
    confirmed = true;
    clearTimeout(confirmTimer);
    confirmTimer = setTimeout(() => (confirmed = false), 1600);
  }

  function cancel() {
    editing = false;
    draft = value;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    } else if (event.key === "Enter" && (!multiline || event.metaKey)) {
      event.preventDefault();
      commit();
    }
  }
</script>

<span
  class="editable"
  class:editable--multiline={multiline}
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
  role="presentation"
>
  {#if editing}
    {#if multiline}
      <textarea
        class="editable__field"
        bind:this={field}
        bind:value={draft}
        aria-label={label}
        {placeholder}
        rows="3"
        onkeydown={onKeydown}
        onblur={commit}
      ></textarea>
    {:else}
      <input
        class="editable__field"
        type="text"
        bind:this={field}
        bind:value={draft}
        aria-label={label}
        {placeholder}
        onkeydown={onKeydown}
        onblur={commit}
      />
    {/if}
  {:else}
    <span class="editable__text" class:editable__text--empty={!value}>
      {value || placeholder}
    </span>
    <GlassPen
      label="Edit {label}"
      visible={hovered}
      onedit={start}
    />
  {/if}

  {#if confirmed}
    <span class="editable__ok" role="status">Saved</span>
  {/if}
</span>

<style>
  .editable {
    display: inline-flex;
    align-items: center;
    gap: var(--l-space-3, 6px);
    position: relative;
    max-width: 100%;
  }

  .editable--multiline {
    display: flex;
    align-items: flex-start;
  }

  .editable__text {
    font: inherit;
    color: inherit;
  }

  .editable__text--empty {
    color: var(--l-ink-300, #8a8b8f);
  }

  /* Same metrics as the text: position and size stay put. */
  .editable__field {
    font: inherit;
    color: inherit;
    width: 100%;
    min-width: 12ch;
    margin: -3px -6px;
    padding: 2px 5px;
    border: 1px solid color-mix(in srgb, var(--brand-accent, #e5484d) 45%, transparent);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-accent, #e5484d) 12%, transparent);
    outline: none;
    resize: vertical;
  }

  .editable__ok {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: var(--l-space-4, 8px);
    white-space: nowrap;

    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--l-ink-500, #55565a);
    animation: fade-in var(--l-dur-base, 220ms) var(--l-ease-out, cubic-bezier(0.16, 1, 0.3, 1));
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translate(-4px, -50%);
    }
    to {
      opacity: 1;
      transform: translate(0, -50%);
    }
  }
</style>
