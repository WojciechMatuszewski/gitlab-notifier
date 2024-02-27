import { TodoSchema } from "@gitbeaker/rest";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type StatusItem = { id: TodoSchema["id"]; unread: boolean };

interface StatusStore {
  _initialized: boolean;

  statusItems: Array<StatusItem>;

  setTodos: (todos: Array<TodoSchema>) => void;
  markAsRead: (todoToMark: TodoSchema) => void;
}

const useTodosStatusStore = create<StatusStore>()(
  persist(
    (set, get) => {
      return {
        _initialized: false as boolean,

        statusItems: [] as Array<StatusItem>,

        setTodos: (providedTodos) => {
          const providedTodosIds = providedTodos.map(
            (providedTodo) => providedTodo.id,
          );

          const existingStatusItems = get().statusItems;

          if (!get()._initialized) {
            const hydratedStatusItems = getHydratedStatusItems({
              existingStatusItems,
              providedTodosIds,
            });

            return set(() => ({
              statusItems: hydratedStatusItems,
              _initialized: true,
            }));
          }

          const existingStatusItemsIds = existingStatusItems.map(
            (currentItem) => currentItem.id,
          );

          const newStatusItemsIds = providedTodosIds.filter(
            (providedTodoId) => {
              return !existingStatusItemsIds.includes(providedTodoId);
            },
          );

          const newStatusItems = newStatusItemsIds.map((newItemId) => {
            return { id: newItemId, unread: true };
          });

          return set(() => ({
            statusItems: [...existingStatusItems, ...newStatusItems],
          }));
        },

        markAsRead: (providedTodo) => {
          const updatedStatusItems = get().statusItems.map((statusItem) => {
            if (statusItem.id !== providedTodo.id) {
              return statusItem;
            }

            return { ...statusItem, unread: false };
          });

          set(() => ({
            statusItems: updatedStatusItems,
          }));
        },
      };
    },
    { name: "todos-status-store" },
  ),
);

export const useSetTodoItems = () => {
  return useTodosStatusStore((store) => store.setTodos);
};

export const useIsTodoUnread = (todo: TodoSchema) => {
  const statusItems = useTodosStatusStore.getState().statusItems;
  const foundStatusItem = statusItems.find((statusItem) => {
    return statusItem.id === todo.id;
  });

  return foundStatusItem?.unread === true;
};

export const useMarkTodoRead = () => {
  return useTodosStatusStore((store) => {
    return store.markAsRead;
  });
};

export const useHasUnreadTodos = () => {
  const statusItems = useTodosStatusStore.getState().statusItems;
  const foundUnreadItem = statusItems.find((statusItem) => {
    return statusItem.unread;
  });

  return foundUnreadItem != null;
};

function getHydratedStatusItems({
  existingStatusItems,
  providedTodosIds,
}: {
  existingStatusItems: Array<StatusItem>;
  providedTodosIds: Array<TodoSchema["id"]>;
}) {
  if (existingStatusItems.length === 0) {
    return providedTodosIds.map((id) => {
      return { id, unread: false };
    });
  }

  const hydratedStatusItems = existingStatusItems.filter(
    (existingStatusItem) => {
      return providedTodosIds.includes(existingStatusItem.id);
    },
  );

  const hydratedStatusItemsIds = hydratedStatusItems.map(
    (hydratedStatusItem) => {
      return hydratedStatusItem.id;
    },
  );

  const newStatusItems = providedTodosIds
    .filter((providedTodoId) => {
      return !hydratedStatusItemsIds.includes(providedTodoId);
    })
    .map((providedTodoId) => {
      return {
        id: providedTodoId,
        unread: true,
      };
    });

  return hydratedStatusItems.concat(newStatusItems);
}
