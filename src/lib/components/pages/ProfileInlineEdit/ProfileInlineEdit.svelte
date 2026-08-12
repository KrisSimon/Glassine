<!--
  PAGE · ProfileInlineEdit
  The same surface at a different size. If the glass panel convinces as a
  bar, the pen in running text has to convince just as much — otherwise it
  is not a system but an effect applied in one place.
-->
<script lang="ts">
  import InlineEditable from "../../organisms/InlineEditable/InlineEditable.svelte";

  interface Props {
    company?: string;
    claim?: string;
    contact?: string;
  }

  let {
    company = $bindable("Northbound Studio"),
    claim = $bindable(
      "An independent practice for identity, interface and interaction design — working with organisations from twelve people to twelve thousand.",
    ),
    contact = $bindable("hello@northbound.example"),
  }: Props = $props();

  let log = $state<string[]>([]);

  function record(field: string) {
    return (value: string) => {
      log = [`${field}: “${value}”`, ...log].slice(0, 4);
    };
  }
</script>

<article class="profile">
  <p class="profile__eyebrow">Public profile · view</p>

  <h1 class="profile__title">
    <InlineEditable bind:value={company} label="Company name" onsave={record("Company name")} />
  </h1>

  <p class="profile__claim">
    <InlineEditable
      bind:value={claim}
      label="Description"
      multiline
      onsave={record("Description")}
    />
  </p>

  <dl class="profile__meta">
    <dt>Contact</dt>
    <dd>
      <InlineEditable bind:value={contact} label="Contact" onsave={record("Contact")} />
    </dd>
  </dl>

  <p class="profile__hint">
    Enter commits · Esc discards · clicking away commits as well.
    Multiline: ⌘ + Enter.
  </p>

  {#if log.length > 0}
    <ul class="profile__log">
      {#each log as entry, i (entry + i)}
        <li>{entry}</li>
      {/each}
    </ul>
  {/if}
</article>

<style>
  .profile {
    max-width: 56ch;
    padding: var(--l-space-7, 24px);
    background: #fff;
    border: 1px solid var(--l-line, #e4e3e0);
    border-radius: var(--l-radius-md, 14px);
    box-shadow: 0 10px 30px rgba(20, 20, 30, 0.06);
  }

  .profile__eyebrow {
    margin: 0 0 10px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--brand-accent-ink, #b8353a);
  }

  .profile__title {
    margin: 0 0 10px;
    font-size: 26px;
    letter-spacing: -0.02em;
  }

  .profile__claim {
    margin: 0 0 18px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--brand-ink-muted, #55565a);
  }

  .profile__meta {
    margin: 0;
    display: grid;
    grid-template-columns: 96px 1fr;
    gap: 6px 12px;
    font-size: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--l-line, #e4e3e0);
  }

  .profile__meta dt {
    color: var(--l-ink-300, #8a8b8f);
  }

  .profile__meta dd {
    margin: 0;
  }

  .profile__hint {
    margin: 18px 0 0;
    font-size: 12px;
    color: var(--l-ink-300, #8a8b8f);
  }

  .profile__log {
    margin: 12px 0 0;
    padding: 10px 12px 10px 26px;
    list-style: "✓  ";
    background: var(--brand-accent-wash, #fdeef0);
    border-radius: 8px;
    font-size: 12px;
    color: var(--brand-accent-ink, #b8353a);
  }
</style>
