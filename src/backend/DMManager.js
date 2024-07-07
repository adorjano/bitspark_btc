// DMManager.js
import { nostrManager } from "./NostrManagerStore.js";
import { nostrCache } from "./NostrCacheStore.js";
import { nip19 } from 'nostr-tools';

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

  async sendMessage(receiverPubKeys, messageContent, subject) {
    if (!this.manager || !this.manager.publicKey) {
      console.error("Manager or public key not initialized.");
      return;
    }

    // Erstelle das unsignedKind14 Event
    const unsignedKind14 = {
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
      // Versiegeln des unsignedKind14 Events (Kind 13)
      const sealContent = await window.nostr.nip44.encrypt(receiverPubKey, JSON.stringify(unsignedKind14));
      const seal = {
        created_at: Math.floor(Date.now() / 1000),
        kind: 13,
        tags: [],
        content: sealContent,
      };

      await window.nostr.signEvent(seal);

      // Wickele das versiegelte Event ein (Kind 1059)
      const giftWrapContent = await window.nostr.nip44.encrypt(receiverPubKey, JSON.stringify(seal));
      const tags = [["p", receiverPubKey]];

      try {
        await this.manager.sendAnonEvent(1059, giftWrapContent, tags);
      } catch (error) {
        console.error(`Error sending message to ${receiverPubKey}:`, error);
      }
    }
  }

  async getMessagesForRoom(participants) {
    const decryptedMessages = await this.getMessages();
    const roomMessages = decryptedMessages.filter(message => {
      const messageParticipants = message.tags.filter(tag => tag[0] === 'p').map(tag => tag[1]).sort().join(',');
      return messageParticipants === participants;
    });

    return roomMessages.sort((a, b) => a.created_at - b.created_at);
  }

  async fetchMessages() {
    const messages = await this.cache.getEventsByCriteria({
      kinds: [1059],
      tags: { p: [this.manager.publicKey] },
    });
    return messages;
  }

  async decryptMessage(message) {
    try {
      const seal = JSON.parse(await window.nostr.nip44.decrypt(this.manager.publicKey, message.content));
      const unsignedKind14 = JSON.parse(await window.nostr.nip44.decrypt(this.manager.publicKey, seal.content));
      return unsignedKind14;
    } catch (error) {
      return null;
    }
  }

  async getMessages() {
    if (!this.manager) {
      return [];
    }

    const messages = await this.fetchMessages();
    const decryptedMessages = [];

    for (const message of messages) {
      if (message.decryptedContent) {
        decryptedMessages.push(message.decryptedContent);
      } else {
        const decryptedMessage = await this.decryptMessage(message);
        if (decryptedMessage) {
          decryptedMessages.push(decryptedMessage);
        }
      }
    }

    console.log(decryptedMessages);

    return decryptedMessages;
  }

  async getChatRooms() {
    const decryptedMessages = await this.getMessages();
    const chatRooms = {};
  
    decryptedMessages.forEach(message => {
      const participantsArray = message.tags
        .filter(tag => tag[0] === 'p')
        .map(tag => tag[1])
        .sort();
  
      // Filtere Chatrooms mit nur einem Teilnehmer
      if (participantsArray.length <= 1) {
        return;
      }
  
      // Filtere Chatrooms mit doppelten Teilnehmern
      const hasDuplicates = participantsArray.some((item, index) => participantsArray.indexOf(item) !== index);
      if (hasDuplicates) {
        return;
      }
  
      // Überprüfe auf ungültige Teilnehmer-PubKeys (zum Beispiel leere Strings)
      const hasInvalidPubKeys = participantsArray.some(pubKey => !pubKey || typeof pubKey !== 'string');
      if (hasInvalidPubKeys) {
        return;
      }
  
      const participants = participantsArray.join(',');
  
      if (!chatRooms[participants]) {
        chatRooms[participants] = {
          participants,
          messages: [],
          subject: null,
          lastSubjectTimestamp: 0
        };
      }
  
      chatRooms[participants].messages.push(message);
  
      const subjectTag = message.tags.find(tag => tag[0] === 'subject');
      if (subjectTag && message.created_at > chatRooms[participants].lastSubjectTimestamp) {
        chatRooms[participants].subject = subjectTag[1];
        chatRooms[participants].lastSubjectTimestamp = message.created_at;
      }
    });
  
    return Object.values(chatRooms);
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
