import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { parseBlob } from 'music-metadata-browser';

function parseFileName(fileName) {
  const nameNoExt = fileName.replace(/\.[^/.]+$/, '');
  const parts = nameNoExt.split(/\s*-\s*/);
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  }
  return { artist: null, title: nameNoExt.trim() };
}

async function fetchInfoFromItunes(artist, title) {
  try {
    const query = encodeURIComponent(artist ? `${artist} ${title}` : title);
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const r = data.results[0];
      return {
        cover: r.artworkUrl100.replace('100x100', '1000x1000'),
        artist: r.artistName || null,
        title: r.trackName || null,
        album: r.collectionName || null,
      };
    }
  } catch (err) {
    console.warn('iTunes lookup failed:', err);
  }
  return null;
}

export const useMusicStore = create(
  persist(
    (set, get) => ({
      hasAskedPermission: false,
      permissionGranted: false,
      needsReconfirm: false,
      storageError: null,
      tracks: [],
      isLoading: false,
      currentTrackId: null,
      isPlaying: false,
      volume: 1,

      requestAccess: async () => {
        try {
          const dirHandle = await window.showDirectoryPicker();
          await idbSet("musicDirHandle", dirHandle);

          // Ask the browser not to evict this site's storage under pressure.
          // Doesn't affect the FS permission itself, only IndexedDB survival.
          if (navigator.storage?.persist) {
            await navigator.storage.persist();
          }

          set({ hasAskedPermission: true, permissionGranted: true, needsReconfirm: false, storageError: null });
          await get().loadTracks(dirHandle);
        } catch (err) {
          console.error("requestAccess error:", err);
          set({ hasAskedPermission: true, permissionGranted: false });
        }
      },

      denyAccess: () =>
        set({ hasAskedPermission: true, permissionGranted: false }),

      initAccess: async () => {
        const { permissionGranted } = get();
        if (!permissionGranted) return;

        let dirHandle;
        try {
          dirHandle = await idbGet("musicDirHandle");
        } catch (err) {
          console.error("Failed reading dirHandle from IndexedDB:", err);
          // IndexedDB itself may have been evicted/cleared by the browser.
          // permissionGranted stays true so the modal shows the "reconnect"
          // message instead of the generic first-run one.
          set({ storageError: "handle-lost" });
          return;
        }

        if (!dirHandle) {
          // Handle genuinely gone (evicted or never existed) — user must re-pick.
          set({ needsReconfirm: false, storageError: "handle-lost" });
          return;
        }

        try {
          const status = await dirHandle.queryPermission({ mode: "read" });
          if (status === "granted") {
            await get().loadTracks(dirHandle);
          } else {
            // Handle still exists, browser just wants a fresh user gesture.
            set({ needsReconfirm: true });
          }
        } catch (err) {
          // Handle reference is stale/broken (e.g. folder moved/deleted).
          console.error("queryPermission failed, handle likely stale:", err);
          set({ needsReconfirm: false, storageError: "handle-lost" });
        }
      },

      reconfirmAccess: async () => {
        // NOTE: must be called directly from a user click/tap handler —
        // requestPermission requires transient user activation.
        let dirHandle;
        try {
          dirHandle = await idbGet("musicDirHandle");
        } catch (err) {
          console.error("Failed reading dirHandle from IndexedDB:", err);
          set({ needsReconfirm: false, storageError: "handle-lost" });
          return;
        }

        if (!dirHandle) {
          set({ needsReconfirm: false, storageError: "handle-lost" });
          return;
        }

        try {
          const status = await dirHandle.requestPermission({ mode: "read" });
          if (status === "granted") {
            if (navigator.storage?.persist) {
              await navigator.storage.persist();
            }
            set({ needsReconfirm: false, storageError: null });
            await get().loadTracks(dirHandle);
          }
          // if denied, leave needsReconfirm true so the UI keeps prompting
        } catch (err) {
          console.error("reconfirmAccess failed, handle likely stale:", err);
          set({ needsReconfirm: false, storageError: "handle-lost" });
        }
      },

      loadTracks: async (dirHandle) => {
        set({ isLoading: true });
        let handle;
        try {
          handle = dirHandle ?? (await idbGet("musicDirHandle"));
        } catch (err) {
          console.error("Failed reading dirHandle from IndexedDB:", err);
          set({ isLoading: false, storageError: "handle-lost" });
          return;
        }
        if (!handle) {
          set({ isLoading: false, storageError: "handle-lost" });
          return;
        }

        try {
          let folderCoverUrl = null;
          const coverNames = ['cover', 'folder', 'album', 'art', 'front'];
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const nameNoExt = entry.name.replace(/\.[^/.]+$/, '').toLowerCase();
              if (/\.(jpg|jpeg|png|webp)$/i.test(entry.name) && coverNames.includes(nameNoExt)) {
                const imgFile = await entry.getFile();
                folderCoverUrl = URL.createObjectURL(imgFile);
                break;
              }
            }
          }

          const tracks = [];
          for await (const entry of handle.values()) {
          if (entry.kind === "file" && /\.(mp3|wav|flac|m4a|ogg)$/i.test(entry.name)) {
            const file = await entry.getFile();

            let title = file.name.replace(/\.[^/.]+$/, "");
            let artist = "Unknown Artist";
            let album = "Unknown Album";
            let coverUrl = null;
            let hasTag = false;

            try {
              const metadata= await parseBlob(file);
              const { common } = metadata;

              if (common.title) { title = common.title; hasTag = true; }
              if (common.artist || common.albumartist) {
                artist = common.artist || common.albumartist;
                hasTag = true;
              }
              if (common.album) { album = common.album; hasTag = true; }

              if (common.picture && common.picture.length > 0) {
                const pic = common.picture[0];
                const blob = new Blob([pic.data], { type: pic.format });
                coverUrl = URL.createObjectURL(blob);
              }
            } catch (err) {
              console.warn(`Couldn't read metadata for ${file.name}`, err);
            }

            if (!coverUrl && folderCoverUrl) {
              coverUrl = folderCoverUrl;
            }

            const cached = await idbGet(`itunes:${file.name}`);
            if (cached && cached !== 'NOT_FOUND') {
              if (!coverUrl) coverUrl = cached.cover;
              if (!hasTag) {
                artist = cached.artist || artist;
                title = cached.title || title;
                album = cached.album || album;
              }
            }

            tracks.push({
              id: crypto.randomUUID(),
              fileName: file.name,
              title,
              artist,
              album,
              coverUrl,
              hasTag,
              url: URL.createObjectURL(file),
              size: file.size,
            });
          }
        }

          set({ tracks, isLoading: false });
          get().fetchMissingCovers();
        } catch (err) {
          // Handle went stale mid-read (folder moved/deleted/unmounted, e.g. a USB drive).
          console.error("loadTracks failed, handle likely stale:", err);
          set({ isLoading: false, needsReconfirm: false, storageError: "handle-lost" });
        }
      },

      fetchMissingCovers: async () => {
        const tracks = get().tracks;
        for (const track of tracks) {
          if (track.coverUrl && track.hasTag) continue;

          const cached = await idbGet(`itunes:${track.fileName}`);
          if (cached !== undefined) continue;

          const { artist, title } = parseFileName(track.fileName);
          const info = await fetchInfoFromItunes(artist, title || track.title);

          if (info) {
            await idbSet(`itunes:${track.fileName}`, info);
            set((state) => ({
              tracks: state.tracks.map((t) =>
                t.id === track.id
                  ? {
                      ...t,
                      coverUrl: t.coverUrl || info.cover,
                      artist: t.hasTag ? t.artist : info.artist || t.artist,
                      title: t.hasTag ? t.title : info.title || t.title,
                      album: t.hasTag ? t.album : info.album || t.album,
                    }
                  : t
              ),
            }));
          } else {
            await idbSet(`itunes:${track.fileName}`, 'NOT_FOUND');
          }

          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      },

      updateTrackInfo: (trackId, updates) => {
        set((state) => ({
          tracks: state.tracks.map((track) =>
            track.id === trackId ? { ...track, ...updates } : track
          ),
        }));
      },

      playTrack: (trackId) => {
        const { currentTrackId, isPlaying } = get();
        if (currentTrackId === trackId) {
          set({ isPlaying: !isPlaying });
        } else {
          set({ currentTrackId: trackId, isPlaying: true });
        }
      },

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      nextTrack: () => {
        const { tracks, currentTrackId } = get();
        if (tracks.length === 0) return;
        const idx = tracks.findIndex((t) => t.id === currentTrackId);
        const nextIdx = idx === -1 ? 0 : (idx + 1) % tracks.length;
        set({ currentTrackId: tracks[nextIdx].id, isPlaying: true });
      },

      prevTrack: () => {
        const { tracks, currentTrackId } = get();
        if (tracks.length === 0) return;
        const idx = tracks.findIndex((t) => t.id === currentTrackId);
        const prevIdx = idx <= 0 ? tracks.length - 1 : idx - 1;
        set({ currentTrackId: tracks[prevIdx].id, isPlaying: true });},

      setVolume: (volume) => set({ volume }),
    }),
    {
      name: "music-permission-store",
      partialize: (state) => ({
        permissionGranted: state.permissionGranted,
        volume: state.volume,
      }),
    },
  ),
);