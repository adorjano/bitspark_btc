<script>
    import { onMount, onDestroy } from "svelte";
    import Menu from "../components/Sidebar/Sidebar.svelte";
    import UserIdeasWidget from "../components/Widgets/UserIdeasWidget.svelte";
    import Footer from "../components/Footers/Footer.svelte";
    import { contentContainerClass } from "../helperStore.js";
    import ToolBar from "../components/Toolbar/Toolbar.svelte";
    import { nostrCache } from "../backend/NostrCacheStore.js";
    import { nostrManager } from "../backend/NostrManagerStore.js";
    import { socialMediaManager } from "../backend/SocialMediaManager.js";
    import ReviewWidget from "../components/Widgets/ReviewWidget.svelte";
    import ProfileWidget from "../components/Widgets/ProfileWidget.svelte";
    import ProfileBannerWidget from "../components/Widgets/Banner/ProfileBannerWidget.svelte";
    import { getPublicKey, nip44 } from 'nostr-tools';

    // Definiere deine geheimen Schlüssel manuell
    const randomKey = "9ab5b12ade1d9c27207ff0264e9fb155c77c9361c9b6a27c865fce1b2c0ddf02";
    const s_pub = "9d84e447c5e6f114b8738554ba07596cc3421a8d20e4456664a9cb89a63250d6";
    const g_pub = "5d4e32a33237ac19032bfcab10c5f62d3a719cf695a0dfe94d3721057f2b48f6";

    // Verschlüsseln mit Alices privatem Schlüssel für Bobs öffentlichen Schlüssel
    async function wrapMessage(message) {
        console.log("encryptMessage2");

        const conversationKey = nip44.utils.v2.getConversationKey(randomKey, g_pub);
        const encrypted = await nip44.encrypt(conversationKey, message);
        return encrypted;
    }
    
    async function decryptMessage(encryptedMessage) {
        console.log("decryptMessage", $nostrManager.publicKey);
        const decrypted = await window.nostr.nip44.encrypt(s_pub, encryptedMessage);

        return decrypted;
    }
    
    //alby
    async function encryptMessage(message) {
        console.log("encryptMessage");
       
        // const conversationKey = window.nostr.nip44.getNip44SharedSecret(g_pub);
        const sealContent = await window.nostr.nip44.encrypt(g_pub, message);
        return sealContent;
    }

    // Entschlüsseln mit Bobs privatem Schlüssel Alby
    async function unwrapMessage(encryptedMessage) {
        console.log("decryptMessage2");

        const decrypted = await window.nostr.nip44.decrypt(getPublicKey(randomKey), encryptedMessage);
        return decrypted;
    }


    async function test() {
        const message = "Geheime Nachricht von Alice an Bob";

        const encrypted = await encryptMessage(message);
        console.log("Verschlüsselte Nachricht:", encrypted);


        const encrypted2 = await wrapMessage(encrypted);
        console.log("Verschlüsselte Nachricht 2:", encrypted2);


        // const decrypted2 = await unwrapMessage(encrypted2);
        // console.log("Entschlüsselte Nachricht 2:", "AoLIfbhedATbeNBey+40uK6eFbvkY/b+r+PH6oxyfJX3K5fL8FHtK6kUSuEW9ueZAXHGYu6BvfEqOJYuhWLBtvnwmlMTbqLqkSFKaLvgu1jt/Nk+ogf7jOE++lZ+t09ngPBRNgG1aGF4IqeZsQtOo7j2T3TQZ3zrgWuwrf3RuHCa9XDq9qMAuPzKQexrzScuptiN3zsDDGSfeTO4D9DIP2aQZZXmhev5EIk6z28d18ZQ+XgE2JYtuZ58iOrILVN4iIwacCns1gJBY0YOuM+Wb9bAOqZlOe80N5tJpOBd1EM6VhqnOSJc2PCc7JmRYqRhpDutJTy52mgGpP1tsaC/wMZ/aA==");


        // const decrypted = await decryptMessage(encrypted2);
        // console.log("Entschlüsselte Nachricht:", "AgbIAGr9MfyYCQU0mydXIbEqG0rxDuaA7+4MD/sPs45Rlfy/7fX2mExxRdizrAYfY8QFqqoFxC08asO737optMgjRTXjUzyPUX+F4/JPtFny0bxYBEiM00/zmq8aN+Fux0yxapUzkCTMyUW7BrqQdL0lh865D8VkT+667CDa0uciLug=");
    }

    export let profile_id;

    let profile = null;
    let name = "";
    let banner = "";
    let githubUsername = "";
    let lightningAddress = "";
    let githubRepo = "";

    onMount(() => {
        initialize();
        test();
    });

    function initialize() {
        if (!$nostrManager) {
            return;
        }
        socialMediaManager.subscribeProfile(profile_id);
        fetchProfile();
    }

    onDestroy(() => {
        if (!$nostrManager) {
            return;
        }
        $nostrManager.unsubscribeAll();
    });

    async function fetchProfile() {
        if (!$nostrManager) {
            return;
        }
        profile = await socialMediaManager.getProfile(profile_id);
        if (!profile) {
            return;
        }

        name = profile.name;
        banner = profile.banner;
        githubUsername = profile.githubUsername;
        lightningAddress = profile.lud16;

        if (githubUsername) {
            githubRepo = "https://www.github.com/" + githubUsername;
        } else {
            githubRepo = "";
        }
    }

    $: $nostrManager, initialize();
    $: $nostrCache, fetchProfile();
    $: profile_id, fetchProfile();
</script>

<main class="overview-page">
    <Menu />
    <div class="flex-grow">
        <ProfileBannerWidget {profile_id} />

        <ToolBar lnAddress={lightningAddress} {githubRepo} />

        <div class={$contentContainerClass}>
            <ProfileWidget userPubKey={profile_id} />
            <UserIdeasWidget {profile_id} />
            <ReviewWidget userPubKey={profile_id} />
        </div>
    </div>
    <Footer />
</main>
