import { MergeRequestSchemaWithBasicLabels, NoteSchema } from "@gitbeaker/rest";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type StatusItem = {
  id: MergeRequestSchemaWithBasicLabels["id"];
  numNotes: number;

  unread: boolean;

  _notesInitialized: boolean;
};

interface StatusStore {
  _initialized: boolean;

  statusItems: Array<StatusItem>;

  setMRs: (mrs: Array<MergeRequestSchemaWithBasicLabels>) => void;
  setNotes: ({
    mr,
    notes,
  }: {
    mr: MergeRequestSchemaWithBasicLabels;
    notes: Array<NoteSchema>;
  }) => void;

  markAsRead: (mrToMark: MergeRequestSchemaWithBasicLabels) => void;
}

const useMRsStatusStore = create<StatusStore>()(
  persist(
    (set, get) => {
      return {
        _initialized: false as boolean,

        statusItems: [] as Array<StatusItem>,

        setMRs: (providedMR) => {
          const providedMRsIds = providedMR.map((providedMR) => providedMR.id);

          const existingStatusItems = get().statusItems;
          const existingStatusItemsIds = existingStatusItems.map(
            (currentItem) => currentItem.id,
          );

          if (!get()._initialized) {
            const hydratedStatusItems = getHydratedStatusItems({
              existingStatusItems,
              providedMRsIds,
            });

            return set(() => ({
              _initialized: true,
              statusItems: hydratedStatusItems,
            }));
          }

          const newStatusItemsIds = providedMRsIds.filter((providedMrId) => {
            return !existingStatusItemsIds.includes(providedMrId);
          });
          const newStatusItems = newStatusItemsIds.map((newItemId) => {
            return {
              id: newItemId,
              numNotes: 0,

              unread: true,
              _notesInitialized: false,
            };
          });

          return set(() => ({
            statusItems: [...existingStatusItems, ...newStatusItems],
          }));
        },

        setNotes: ({ mr, notes }) => {
          const existingStatusItems = get().statusItems;
          const existingStatusItem = existingStatusItems.find((statusItem) => {
            return statusItem.id === mr.id;
          });
          if (!existingStatusItem) {
            return;
          }

          const updatedStatusItems = existingStatusItems.map((statusItem) => {
            if (statusItem.id !== existingStatusItem.id) {
              return statusItem;
            }

            const notesInitialized = existingStatusItem._notesInitialized;

            const unreadBasedOnNotes = statusItem.numNotes !== notes.length;
            const unread = notesInitialized
              ? unreadBasedOnNotes || statusItem.unread
              : false;

            return {
              ...statusItem,
              _notesInitialized: true,

              numNotes: notes.length,

              unread: unread,
            };
          });

          return set(() => ({
            statusItems: updatedStatusItems,
          }));
        },

        markAsRead: (providedMR) => {
          const updatedStatusItems = get().statusItems.map((statusItem) => {
            if (statusItem.id !== providedMR.id) {
              return statusItem;
            }

            return { ...statusItem, unread: false };
          });

          return set(() => ({
            statusItems: updatedStatusItems,
          }));
        },
      };
    },
    { name: "mrs-status-store" },
  ),
);

export const useSetMRs = () => {
  return useMRsStatusStore((store) => store.setMRs);
};

export const useSetNotes = () => {
  return useMRsStatusStore((store) => store.setNotes);
};

export const useIsMrUnread = (mr: MergeRequestSchemaWithBasicLabels) => {
  const statusItems = useMRsStatusStore.getState().statusItems;
  const foundStatusItem = statusItems.find((statusItem) => {
    return statusItem.id === mr.id;
  });

  return foundStatusItem?.unread === true;
};

export const useMarkMrAsRead = () => {
  return useMRsStatusStore((store) => {
    return store.markAsRead;
  });
};

export const useHasUnreadMRs = () => {
  const statusItems = useMRsStatusStore.getState().statusItems;
  const foundUnreadItem = statusItems.find((statusItem) => {
    return statusItem.unread;
  });

  return foundUnreadItem != null;
};

function getHydratedStatusItems({
  existingStatusItems,
  providedMRsIds,
}: {
  existingStatusItems: Array<StatusItem>;
  providedMRsIds: Array<MergeRequestSchemaWithBasicLabels["id"]>;
}) {
  if (existingStatusItems.length === 0) {
    return providedMRsIds.map((id) => {
      return {
        id,
        numNotes: 0,

        unread: false,
        _notesInitialized: false,
      };
    });
  }

  const hydratedStatusItems = existingStatusItems.filter(
    (existingStatusItem) => {
      return providedMRsIds.includes(existingStatusItem.id);
    },
  );

  const hydratedStatusItemsIds = hydratedStatusItems.map(
    (hydratedStatusItem) => {
      return hydratedStatusItem.id;
    },
  );

  const newStatusItems = providedMRsIds
    .filter((providedMrId) => {
      return !hydratedStatusItemsIds.includes(providedMrId);
    })
    .map((providedTodoId) => {
      return {
        id: providedTodoId,
        numNotes: 0,

        unread: true,
        _notesInitialized: false,
      };
    });

  return hydratedStatusItems.concat(newStatusItems);
}
