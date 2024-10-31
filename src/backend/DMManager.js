// DMManager.js
import { nostrManager } from "./NostrManagerStore.js";
import { nostrCache } from "./NostrCacheStore.js";
import { nip19, nip44 } from 'nostr-tools';

class DMManager {
  constructor() {
    this.init();
  }

  init() {
    // Initialisiere die Store-Abonnements
    this.cacheSubscription = this.subscribeToStore(nostrCache, (value) => {
      this.cache = value;
    });

    this.managerSubscription = this.subscribeToStore(nostrManager, (value) => {
      this.manager = value;
    });
  }

  subscribeToStore(store, updateFunction) {
    const unsubscribe = store.subscribe(updateFunction);
    return unsubscribe; // Rückgabe der Unsubscribe-Funktion für spätere Aufräumaktionen
  }

  async wrapMessage(unsignedKind14, receiverPubKey) {
    const anonPrivateKey = window.NostrTools.generateSecretKey();
    const anonPublicKey = window.NostrTools.getPublicKey(anonPrivateKey);

    // Erstelle das versiegelte Event (Kind 13)
    const sealContent = await window.nostr.nip44.encrypt(receiverPubKey, JSON.stringify(unsignedKind14));
    let seal = {
      created_at: Math.floor(Date.now() / 1000),
      kind: 13,
      tags: [],
      content: sealContent,
    };
    seal = await window.nostr.signEvent(seal);

    // Wickele das versiegelte Event ein (Kind 1059)
    const conversationKey = nip44.getConversationKey(anonPrivateKey, receiverPubKey);
    const giftWrapContent = await nip44.encrypt(JSON.stringify(seal), conversationKey);
    
    return {
      content: giftWrapContent,
      anonPrivateKey,
      anonPublicKey
    };
  }

  async sendMessage(receiverPubKeys, messageContent, subject) {
    if (!this.manager || !this.manager.publicKey) {
      console.error("Manager or public key not initialized.");
      return;
    }

    const kind14 = {
      pubkey: this.manager.publicKey,
      created_at: Math.floor(Date.now() / 1000),
      kind: 14,
      tags: [
        ...receiverPubKeys.map(receiverPubKey => ["p", receiverPubKey]),
        ...(subject ? [["subject", subject]] : []),
      ],
      content: messageContent,
    };

    for (const receiverPubKey of receiverPubKeys) {
      try {
        const { content, anonPrivateKey, anonPublicKey } = await this.wrapMessage(kind14, receiverPubKey);
        const tags = [["p", receiverPubKey]];
        
        await this.manager.sendAnonEvent(1059, content, tags, anonPrivateKey, anonPublicKey);
      } catch (error) {
        console.error(`Error sending message to ${receiverPubKey}:`, error);
      }
    }
  }

  async getMessagesByRoom() {
    if (!this.manager) {
      return new Map();
    }

    const messages = await this.cache.getEventsByCriteria({
      kinds: [14],
      tags: { p: [this.manager.publicKey] }
    });

    const messagesByRoom = new Map();

    messages.forEach(message => {
      const participantsArray = message.tags
        .filter(tag => tag[0] === 'p')
        .map(tag => tag[1])
        .sort();

      if (this.isValidRoom(participantsArray)) {
        const participants = participantsArray.join(',');
        if (!messagesByRoom.has(participants)) {
          messagesByRoom.set(participants, []);
        }
        messagesByRoom.get(participants).push(message);
      }
    });

    // Sortiere Nachrichten in jedem Room
    messagesByRoom.forEach(messages => {
      messages.sort((a, b) => a.created_at - b.created_at);
    });

    return messagesByRoom;
  }

  hasDuplicates(array) {
    return array.some((item, index) => array.indexOf(item) !== index);
  }

  hasInvalidPubKeys(pubKeys) {
    return pubKeys.some(pubKey => !pubKey || typeof pubKey !== 'string' || pubKey.length !== 64);
  }

  isValidRoom(participantsArray) {
    return participantsArray.length > 1 && 
           !this.hasDuplicates(participantsArray) && 
           !this.hasInvalidPubKeys(participantsArray);
  }

  async getChatRooms() {
    const messagesByRoom = await this.getMessagesByRoom();
    return Array.from(messagesByRoom.entries()).map(([participants, messages]) => ({
      participants,
      messages,
      subject: this.getLatestSubject(messages),
      lastSubjectTimestamp: this.getLatestSubjectTimestamp(messages)
    }));
  }

  async getMessagesForRoom(participants) {
    const messagesByRoom = await this.getMessagesByRoom();
    return messagesByRoom.get(participants) || [];
  }

  getLatestSubject(messages) {
    const messageWithSubject = [...messages]
      .reverse()
      .find(msg => msg.tags.some(tag => tag[0] === 'subject'));
    return messageWithSubject?.tags.find(tag => tag[0] === 'subject')?.[1] || null;
  }

  getLatestSubjectTimestamp(messages) {
    const messageWithSubject = [...messages]
      .reverse()
      .find(msg => msg.tags.some(tag => tag[0] === 'subject'));
    return messageWithSubject?.created_at || 0;
  }

  subscribeToMessages() {
    if (!this.manager) {
      console.error("NostrManager is not initialized.");
      return;
    }

    this.manager.subscribeToEvents({
      kinds: [1059],
      "#p": [this.manager.publicKey],
    });
  }

  unsubscribeFromMessages() {
    if (!this.manager) {
      console.error("NostrManager is not initialized.");
      return;
    }

    this.manager.unsubscribeEvent({
      kinds: [1059],
      "#p": [this.manager.publicKey],
    });
  }

  cleanup() {
    this.cacheSubscription();
    this.managerSubscription();
  }
}

const dmManager = new DMManager();
export { dmManager };
