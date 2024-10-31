<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { dmManager } from "../../backend/DMManager.js";
    import { nostrManager } from "../../backend/NostrManagerStore.js";
    import { nostrCache } from "../../backend/NostrCacheStore.js";
    import { socialMediaManager } from "../../backend/SocialMediaManager.js";
    import { writable } from "svelte/store";
    import ProfileImg from "../ProfileImg.svelte";

    let chatRooms = writable([]);
    let profiles = writable(new Map());
    const dispatch = createEventDispatcher();
    export let pubkey = null;

    // Updates chat rooms whenever the cache or manager changes
    $: if ($nostrManager && $nostrCache) {
        updateChatRooms();
    }

    onMount(async () => {
        await dmManager.init();
        dmManager.subscribeToMessages();
        await updateChatRooms();
    });

    async function updateChatRooms() {
        const messagesByRoom = await dmManager.getMessagesByRoom();
        const rooms = Array.from(messagesByRoom.entries()).map(([participants, messages]) => ({
            participants,
            messages,
            subject: dmManager.getLatestSubject(messages),
            lastSubjectTimestamp: dmManager.getLatestSubjectTimestamp(messages)
        }));
        chatRooms.set(rooms);
        
        if (pubkey) {
            let existingRoom = rooms.find(room => room.participants.split(',').includes(pubkey));
            
            if (existingRoom) {
                handleRoomClick(existingRoom);
            } else {
                let dummyRoom = createDummyRoom(pubkey);
                rooms.push(dummyRoom);
                chatRooms.set(rooms);
                handleRoomClick(dummyRoom);
            }
        }

        await fetchProfiles(rooms.map((room) => room.participants.split(',')));
    }

    async function fetchProfiles(pubkeys) {
        const profilePromises = pubkeys.flat().map(async (pubkey) => {
            let profile = await socialMediaManager.getProfile(pubkey);
            return { pubkey, profile };
        });

        const results = await Promise.all(profilePromises);
        profiles.update((map) => {
            results.forEach(({ pubkey, profile }) => {
                if (profile) {
                    map.set(pubkey, profile);
                }
            });
            return map;
        });
    }

    function createDummyRoom(pubkey) {
        return {
            participants: [pubkey, $nostrManager.publicKey].sort().join(','),
            messages: [],
            subject: "New Chat",
            lastSubjectTimestamp: Date.now() / 1000
        };
    }

    function handleRoomClick(room) {
        dispatch("selectRoom", room);
    }
</script>

<div class="chat-list">
    <h2>Chat Rooms</h2>
    {#each $chatRooms as room}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="chat-room" on:click={() => handleRoomClick(room)}>
            <div class="room-header">
                {#each room.participants.split(',') as participant (participant)}
                    {#if $profiles.has(participant) && participant != $nostrManager.publicKey}
                        <ProfileImg
                            profile={$profiles.get(participant)}
                            style={{
                                width: "50px",
                                height: "50px",
                                "margin-right": "15px",
                            }}
                        />
                        <h3 class="room-name">
                            {$profiles.get(participant).name}
                        </h3>
                    {/if}
                {/each}
            </div>
            {#if room.subject}
                <p class="subject">{room.subject}</p>
            {/if}
        </div>
    {/each}
</div>

<style>
    .chat-list {
        width: 30%;
        border-right: 1px solid #ccc;
        padding: 1rem;
    }

    .chat-room {
        cursor: pointer;
        padding: 0.5rem;
        border-bottom: 1px solid #ddd;
    }

    .chat-room:hover {
        background-color: #f5f5f5;
    }

    .room-header {
        display: flex;
        align-items: center;
        margin-bottom: 5px; /* Abstand zwischen header und subject */
    }

    .room-name {
        margin: 0;
        flex-grow: 1; /* Falls der Name sehr lang ist, bleibt der Abstand zum Profilbild gleich */
    }

    .subject {
        color: #888;
        font-size: 0.9rem;
        margin: 0;
        margin-top: 5px;
    }
</style>
