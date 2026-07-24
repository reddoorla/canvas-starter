<script lang="ts">
  import BrandIcon from "./BrandIcon.svelte";
  import type { FooterSocial } from "$lib/blux/site-config";

  interface Props {
    /** Social links from the site config (empty → none rendered). */
    socials?: FooterSocial[];
    /** The copyright / rights line; falls back to a generic notice. */
    text?: string;
  }

  let { socials = [], text }: Props = $props();

  // Blux network id → the BrandIcon glyph + an accessible label. Networks
  // BrandIcon can't draw are dropped rather than rendered as an empty link.
  const NETWORK: Record<string, { platform: string; label: string }> = {
    facebook: { platform: "facebook", label: "Facebook" },
    twitter: { platform: "twitter", label: "Twitter" }, // BrandIcon aliases → X
    x: { platform: "x", label: "X" },
    instagram: { platform: "instagram", label: "Instagram" },
    linkedin: { platform: "linkedin", label: "LinkedIn" },
    "linkedin-company": { platform: "linkedin", label: "LinkedIn" },
    pinterest: { platform: "pinterest", label: "Pinterest" },
    youtube: { platform: "youtube", label: "YouTube" },
    reddit: { platform: "reddit", label: "Reddit" },
  };

  const known = $derived(
    socials
      // `Object.hasOwn` guard: a network literally named "toString" or
      // "constructor" would otherwise resolve to an inherited Object.prototype
      // member (truthy) and slip past the filter, then crash on `.platform`.
      .map((s) => ({
        ...s,
        meta: Object.hasOwn(NETWORK, s.network)
          ? NETWORK[s.network]
          : undefined,
      }))
      .filter(
        (s): s is typeof s & { meta: { platform: string; label: string } } =>
          !!s.meta,
      ),
  );
</script>

<footer class="mt-auto w-full px-8 py-12">
  <div
    class="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 sm:flex-row"
  >
    {#if known.length > 0}
      <ul class="flex items-center gap-4">
        <!-- Keyed by index: a network can repeat across footer blocks, and a
             duplicate key throws each_key_duplicate at hydration. -->
        {#each known as social, i (i)}
          <li>
            {#if social.href}
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.meta.label}
                class="inline-flex min-h-11 min-w-11 items-center justify-center hover:opacity-70"
              >
                <BrandIcon platform={social.meta.platform} class="h-5 w-5" />
              </a>
            {:else}
              <!-- No recovered url — render the glyph, but not as a dead link. -->
              <span
                class="inline-flex min-h-11 min-w-11 items-center justify-center"
                aria-label={social.meta.label}
                role="img"
              >
                <BrandIcon platform={social.meta.platform} class="h-5 w-5" />
              </span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
    <p class="text-sm text-secondary">
      {text ?? `© ${new Date().getFullYear()} Company Name`}
    </p>
  </div>
</footer>
