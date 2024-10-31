<script>
    import { onMount, afterUpdate } from 'svelte';
    import { writable, get } from 'svelte/store';
    import Message from './Message.svelte';
    import MessageInput from './MessageInput.svelte';
    import { nostrCache } from '../../backend/NostrCacheStore.js';
    import { dmManager } from '../../backend/DMManager.js';
    import { socialMediaManager } from '../../backend/SocialMediaManager.js';

    export let selectedRoom;

    let messages = writable([]);
    let profiles = writable(new Map());
    let messageContainer;
    let latestTimestamp = writable(0);

    // Updates messages and fetches profiles whenever the selected room changes
    $: if ($selectedRoom) {
        fetchMessages();
    }

    // Fetches messages for the selected room from the cache
    async function fetchMessages() {
        if ($selectedRoom) {
            const messagesByRoom = await dmManager.getMessagesByRoom();
            const fetchedMessages = messagesByRoom.get($selectedRoom.participants) || [];
            messages.set(fetchedMessages);
            await fetchProfiles(fetchedMessages.map(msg => msg.pubkey));

            // Update the latest message timestamp
            if (fetchedMessages.length > 0) {
                latestTimestamp.set(fetchedMessages[fetchedMessages.length - 1].created_at);
            }
        }
    }

    async function fetchProfiles(pubkeys) {
        const profilePromises = pubkeys.map(async (pubkey) => {
            let profile = await socialMediaManager.getProfile(pubkey);
            return { pubkey, profile };
        });

        const results = await Promise.all(profilePromises);
        profiles.update(map => {
            results.forEach(({ pubkey, profile }) => {
                if (profile) {
                    map.set(pubkey, profile);
                }
            });
            return map;
        });
    }

    // Scroll to the bottom when a new message is added
    $: latestTimestamp.subscribe((newTimestamp) => {
        if (messageContainer && newTimestamp > 0) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    });

    // Updates messages whenever the cache changes
    $: if ($nostrCache) {
        fetchMessages();
    }

    $: profiles;
</script>
  
<div class="chat-room">
    <div class="chat-header">
        {#if $selectedRoom.subject}
            <p class="subject">{$selectedRoom.subject}</p>
        {/if}
    </div>
    <div class="messages" bind:this={messageContainer}>
        {#each $messages as message}
            <Message {message} {profiles} />
        {/each}
    </div>
    <MessageInput {selectedRoom} />
</div>
  
<style>
    .chat-room {
        width: 70%;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }

    .chat-header {
        display: flex;
        align-items: center;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
        margin-bottom: 1rem;
    }

    .subject {
        color: #888;
        font-size: 1rem;
        margin: 0;
        margin-top: 5px;
    }

    .messages {
        flex-grow: 1;
        overflow-y: auto;
    }
</style>
