<script>
  import { nostrManager } from "../../backend/NostrManagerStore.js";
  import { onMount, onDestroy } from "svelte";
  import { socialMediaManager } from "../../backend/SocialMediaManager.js";
  import LikeIcon from "../LikeIcon.svelte";
  import ShareIcon from "../ShareIcon.svelte";
  import { navigate } from "svelte-routing";

  export let card;

  function goToIdea() {
    navigate(`/idea/${card.id}`);
  }

  function truncateMessage(message, maxLength) {
    const strippedMessage = message.replace(/<[^>]+>/g, "");
    return strippedMessage.length <= maxLength
      ? message
      : message.slice(0, maxLength) + "...";
  }

  onMount(() => {
    initialize();
  });

  function initialize() {
    if (card) {
      socialMediaManager.getProfile(card.pubkey);
    }
  }

  $: $nostrManager, initialize();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="bitspark-card">
  <div class="bitspark-card-content" on:click={goToIdea}>
    <img
      src={card.bannerImage}
      alt="Banner of {card.name}"
      class="bitspark-card-banner-image"
    />
    <div class="content">
      <h3>{card.name}</h3>
      <h4>{card.subtitle}</h4>
      <p>{truncateMessage(card.abstract, 500)}</p>
    </div>
  </div>
  <div class="bitspark-card-actions">
    <LikeIcon event_id={card.id} />
    <ShareIcon event_id={card.id} />
  </div>
</div>
