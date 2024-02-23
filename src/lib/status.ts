import { invoke } from "@tauri-apps/api";
import { useCallback } from "react";
import { create } from "zustand";

type Item = number;

interface StatusStore {
  initialized: boolean;

  items: Array<Item>;
  setItems: (newItems: Array<Item>) => void;

  unreadItems: Array<Item>;
  markAsRead: (itemToMark: number) => void;
}

const useStatusStore = create<StatusStore>()((set, get) => {
  return {
    initialized: false,

    unreadItems: [],

    items: [],

    setItems: (items: Array<Item>) => {
      const currentStore = get();

      if (!currentStore.initialized) {
        return set(() => ({
          initialized: true,
          items
        }));
      }

      if (items.length === 0) {
        return set(() => ({
          items: [],
          unreadItems: []
        }));
      }

      const currentItems = get().items;
      const newItemsForThisUpdate = items.filter((item) => {
        return !currentItems.includes(item);
      });
      const newItems = [...get().unreadItems, ...newItemsForThisUpdate];

      return set(() => ({ items, unreadItems: newItems }));
    },

    markAsRead: (item: number) => {
      const updatedNewItems = get().unreadItems.filter((currentItem) => {
        return currentItem != item;
      });
      return set(() => ({
        unreadItems: updatedNewItems
      }));
    }
  };
});

export const useSetItems = () => {
  return useStatusStore((store) => store.setItems);
};

export const useIsUnread = (id: number) => {
  const unreadItems = useStatusStore((store) => store.unreadItems);
  return unreadItems.includes(id);
};

export const useGetIsUnread = () => {
  const unreadItems = useStatusStore((store) => store.unreadItems);

  return useCallback(
    (id: number) => {
      return unreadItems.includes(id);
    },
    [unreadItems]
  );
};

export const useMarkAsRead = () => {
  return useStatusStore((store) => {
    return store.markAsRead;
  });
};

export const useHasUnread = () => {
  return useStatusStore((store) => store.unreadItems).length > 0;
};

useStatusStore.subscribe((state, prevState) => {
  if (prevState.items.length !== state.items.length) {
    invoke("set_count", { count: `${state.items.length}` });
  }
});
