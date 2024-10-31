// NostrCacheStore.js
import { writable } from 'svelte/store';
import { nostrManager } from "./NostrManagerStore.js";
const { nip19 } = window.NostrTools;

// Definiert die Struktur des Cache-Objekts
class NostrEventCache {
  constructor() {
    this.events = new Map();
    this.kindIndex = new Map();
    this.authorIndex = new Map();
  }

  // Methode zum Löschen eines Events
  deleteEvent(eventId) {
    const event = this.events.get(eventId);
    if (!event) {
      console.error("Event to delete not found:", eventId);
      return false;
    }

    // Entfernen des Events aus der Haupt-Map
    this.events.delete(eventId);

    // Entfernen des Events aus dem kindIndex
    if (event.kind && this.kindIndex.has(event.kind)) {
      const kindSet = this.kindIndex.get(event.kind);
      if (kindSet.has(event)) {
        kindSet.delete(event);
        // Wenn das Set leer ist, entferne den Eintrag aus der Map
        if (kindSet.size === 0) {
          this.kindIndex.delete(event.kind);
        }
      }
    }

    // Entfernen des Events aus dem authorIndex
    if (event.pubkey && this.authorIndex.has(event.pubkey)) {
      const authorSet = this.authorIndex.get(event.pubkey);
      if (authorSet.has(event)) {
        authorSet.delete(event);
        // Wenn das Set leer ist, entferne den Eintrag aus der Map
        if (authorSet.size === 0) {
          this.authorIndex.delete(event.pubkey);
        }
      }
    }

    console.log("Event deleted successfully:", eventId);
    return true;
  }


  // Methode in der NostrEventCache-Klasse
  // Methode in der NostrEventCache-Klasse
  updateEventAfterAsyncProcessing(eventId, updateFunction) {
    nostrCache.update(cache => {
      const event = cache.events.get(eventId);
      if (event) {
        // Hier führen wir die übergebene Update-Funktion aus, die das Event modifiziert
        updateFunction(event);

        // Setze das aktualisierte Event zurück in den Cache
        cache.events.set(eventId, event);
      }
      return cache;
    });
  }

  async fetchProfile(pubkey) {
    if (!pubkey) return;
    const profileEvents = this.getEventsByCriteria({
      kinds: [0],
      authors: [pubkey],
    });

    if (profileEvents.length > 0) {
      profileEvents.sort((a, b) => b.created_at - a.created_at);
      return profileEvents[0].profileData;
    }

  }

  async validateGithubIdent(username, pubkey, proof) {
    try {
      const gistUrl = `https://api.github.com/gists/${proof}`;

      const response = await fetch(gistUrl, { mode: 'cors' });
      const data = await response.json();

      const nPubKey = nip19.npubEncode(pubkey);

      const expectedText = `${nPubKey}`;

      for (const file in data.files) {
        if (data.files[file].content.includes(expectedText) &&
          data.files[file].raw_url.includes(username)) {
          console.log(username, "verified!")
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error(`Error in validateGithubIdent: ${error}`);
      return false;
    }
  }

  // Hilfsmethode zur Verarbeitung von Profil-Events
  async processProfileEvent(event) {
    // Frühzeitige Rückkehr, wenn es sich nicht um ein Profil-Event handelt
    if (event.kind !== 0) {
      return;
    }

    // Versuchen, den Inhalt des Events zu parsen
    try {
      event.profileData = JSON.parse(event.content);
    } catch (e) {
      console.error("Fehler beim Parsen des Profil-Contents", e);
      event.profileData = {};
    }

    event.profileData.pubkey = event.pubkey;

    // Extrahieren der GitHub-Informationen aus den Tags
    event.verified = false;

    // GitHub-Verifikation ausführen, wenn vorhanden
    const githubTag = event.tags.find(tag => tag[0] === "i" && tag[1].startsWith("github:"));
    if (githubTag) {
      const githubParts = githubTag[1].split(":");
      event.profileData.githubUsername = githubParts[1];
      event.profileData.githubProof = githubTag[2];

      //helper function
      function updateProfileVerification(event, isValid) {
        event.profileData.verified = isValid;
      }

      // Rufe die validateGithubIdent-Funktion im Hintergrund auf
      this.validateGithubIdent(githubParts[1], event.pubkey, githubTag[2])
        .then(isValid => {
          this.updateEventAfterAsyncProcessing(event.id, event => updateProfileVerification(event, isValid));
        })
        .catch(error => {
          console.error("GitHub-Verifikation fehlgeschlagen", error);
        });
    }

    // Weitere spezifische Verarbeitung kann hier hinzugefügt werden
  }

  async processEncryptedMessage(event) {
    if (event.kind !== 1059) {
      return event;
    }

    try {
      let publicKey;
      nostrManager.subscribe(manager => {
        publicKey = manager.publicKey;
      })();

      if (!publicKey) {
        console.error("NostrManager public key is not available.");
        event.decryptedContent = null;
        return event;
      }

      let seal;
      let unsignedKind14;
      let decrypt;
      try {
        decrypt = await window.nostr.nip44.decrypt(event.pubkey, event.content);
        seal = await JSON.parse(decrypt);
      } catch (error) {
        // console.error("Error decrypting seal", event, error, decrypt);
      }

      try {
        unsignedKind14 = await JSON.parse(await window.nostr.nip44.decrypt(seal.pubkey, seal.content));
        Object.assign(event, unsignedKind14);
      } catch (error) {
        // console.error("Error decrypting 14", seal, error);
      }
    } catch (error) {
      // console.log("ErrorXL:", error, event);
      event = null;
    }
  }

  getDecryptedMessages() {
    let decryptedMessages = [];
    for (let event of this.events.values()) {
      if (event.decryptedContent) {
        decryptedMessages.push(event.decryptedContent);
      }
    }
    return decryptedMessages;
  }

  // Fügt ein Event hinzu oder aktualisiert es
  async addOrUpdateEvent(event) {
    // Prüfen, ob das Event bereits existiert
    const existingEvent = this.events.get(event.id);

    if (!existingEvent) {
      await this.processProfileEvent(event);
      await this.processEncryptedMessage(event);

      // Add new event if it does not exist
      if (event) {
        this.events.set(event.id, event);
      }

      // Aktualisieren der kindIndex Map
      if (!this.kindIndex.has(event.kind)) {
        this.kindIndex.set(event.kind, new Set());
      }
      this.kindIndex.get(event.kind).add(event);

      // Aktualisieren der authorIndex Map
      if (!this.authorIndex.has(event.pubkey)) {
        this.authorIndex.set(event.pubkey, new Set());
      }
      this.authorIndex.get(event.pubkey).add(event);

      sendSignal();
    }
  }

  // Holt ein Event anhand seiner ID
  getEventById(eventId) {
    return this.events.get(eventId);
  }

  // Filtert Events basierend auf übergebenen Kriterien
  getEventsByCriteria(criteria) {
    let filteredEvents = new Set(this.events.values());

    // Nutzen der Indizes für 'kinds' und 'authors'
    if (criteria.kinds) {
      filteredEvents = new Set(
        criteria.kinds.flatMap(kind => Array.from(this.kindIndex.get(kind) || []))
      );
    }
    if (criteria.authors) {
      const authorFiltered = new Set(
        criteria.authors.flatMap(author => Array.from(this.authorIndex.get(author) || []))
      );
      filteredEvents = new Set([...filteredEvents].filter(event => authorFiltered.has(event)));
    }

    // Für Tags und weitere Filter den reduzierten Event-Satz durchsuchen
    if (criteria.tags) {
      filteredEvents = new Set([...filteredEvents].filter(event =>
        this.matchesCriteria(event, criteria)
      ));
    }

    return Array.from(filteredEvents);
  }

  // Hilfsmethode zur Überprüfung der Kriterienübereinstimmung
  matchesCriteria(event, criteria) {
    for (let key in criteria) {
      if (key === 'kinds' && !criteria.kinds.includes(event.kind)) {
        return false;
      }

      if (key === 'authors' && !criteria.authors.includes(event.pubkey)) {
        return false;
      }

      if (criteria.tags) {
        for (let tagKey in criteria.tags) {
          const tagValues = event.tags.filter(tag => tag[0] === tagKey).map(tag => tag[1]);
          // Überprüft, ob jeder Wert im Filter auch in der Tag-Liste ist
          if (!criteria.tags[tagKey].some(value => tagValues.includes(value))) {
            return false;
          }
        }
      }
    }

    return true;
  }
}

// Erstellt einen Svelte Store mit einer Instanz von NostrEventCache
const cache = new NostrEventCache();
export const nostrCache = writable(cache);

// Beispiel für eine Exportmethode, um ein Event hinzuzufügen oder zu aktualisieren
export const addOrUpdateEvent = (event) => {
  nostrCache.update(cache => {
    cache.addOrUpdateEvent(event);
    return cache;
  });
};

export const deleteEventFromCache = (eventId) => {
  nostrCache.update(cache => {
    cache.deleteEvent(eventId);
    return cache;
  });
};

// Beispiel für eine Exportmethode, um Events nach Kriterien zu filtern
export const getEventsByCriteria = (criteria) => {
  let filteredEvents;
  nostrCache.subscribe(cache => {
    filteredEvents = cache.getEventsByCriteria(criteria);
  })();
  return filteredEvents;
};

export const sendSignal = () => {
  nostrCache.update(cache => {
    return cache;
  });
};
