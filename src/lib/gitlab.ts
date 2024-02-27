import { create } from "zustand";

import { Gitlab } from "@gitbeaker/rest";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { persist } from "zustand/middleware";
import { useSetMRs, useSetNotes } from "./mrs-status";
import { useMarkTodoRead, useSetTodoItems } from "./todos-status";

interface TokenStore {
  apiToken: string;

  setApiToken: (token: string) => void;
  getApiToken: () => string;
}

const useGitlabTokenStore = create<TokenStore>()(
  persist(
    (set, get) => {
      return {
        apiToken: "",
        setApiToken: (token: string) => {
          return set(() => ({ apiToken: token }));
        },
        getApiToken: () => {
          return get().apiToken;
        },
      };
    },
    {
      name: "gitlab-token-storage",
    },
  ),
);

const client = new Gitlab({
  token: async () => {
    const token = useGitlabTokenStore.getState().apiToken;
    if (token.length <= 1) {
      throw new Error("Token not initialized");
    }

    return token;
  },
});

export const useGitlabToken = () => {
  const { apiToken, getApiToken, setApiToken } = useGitlabTokenStore();

  return {
    token: apiToken,
    getToken: getApiToken,
    setToken: setApiToken,
  };
};

export const useFetchTodosSuspense = () => {
  const setTodoItems = useSetTodoItems();

  return useSuspenseQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const todos = await client.TodoLists.all();
      setTodoItems(todos);

      return todos;
    },
  });
};

export const useFetchMRsSuspense = ({
  projectName,
}: {
  projectName: string;
}) => {
  const setMRs = useSetMRs();

  return useSuspenseQuery({
    queryKey: ["mergeRequests", projectName],
    queryFn: async () => {
      const mrs = await client.MergeRequests.all({
        projectId: projectName,
        state: "opened",
        sort: "desc",
        orderBy: "updated_at",
      });

      setMRs(mrs);

      return mrs;
    },
  });
};

export const usePoolMRs = ({ projectName }: { projectName: string }) => {
  const refetchInterval = useMemo(
    () =>
      randomIntFromInterval({
        min: 15_000,
        max: 45_000,
      }),
    [],
  );

  const { token } = useGitlabToken();

  const setMRs = useSetMRs();
  const { data: mrs = [] } = useQuery({
    queryKey: ["mergeRequests", projectName],
    queryFn: async () => {
      const mrs = await client.MergeRequests.all({
        projectId: projectName,
        state: "opened",
        sort: "desc",
        orderBy: "updated_at",
      });

      setMRs(mrs);

      return mrs;
    },
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: true,
    enabled: token.length > 1,
  });

  const setNotes = useSetNotes();
  const results = useQueries({
    queries: mrs.map((mr) => {
      return {
        queryKey: ["mergeRequestNote", projectName, mr.iid],
        queryFn: async () => {
          const notes = await client.MergeRequestNotes.all(projectName, mr.iid);

          setNotes({ mr, notes });

          return notes;
        },
      };
    }),
  });

  const hasItemsLoading = results.find((result) => {
    return result.isLoading || result.isRefetching;
  });

  // TODO: refetch without infinite loop

  // useEffect(() => {
  //   if (hasItemsLoading) {
  //     return;
  //   }
  //
  //   results.forEach((result) => {
  //     const refetchWaitFor = randomIntFromInterval({
  //       min: 15_000,
  //       max: 45_000,
  //     });
  //
  //     new Promise((resolve) => {
  //       setTimeout(resolve, refetchWaitFor);
  //     }).then(() => {
  //       void result.refetch();
  //     });
  //   });
  // }, [hasItemsLoading, results]);
};

export const usePoolTodos = () => {
  const refetchInterval = useMemo(
    // () => randomIntFromInterval({ min: 15_000, max: 45_000 }),
    () => randomIntFromInterval({ min: 5_000, max: 5_000 }),
    [],
  );

  const { token } = useGitlabToken();

  const setTodoItems = useSetTodoItems();

  useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const todos = await client.TodoLists.all();

      setTodoItems(todos);

      return todos;
    },
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: true,
    throwOnError: false,
    enabled: token.length > 1,
  });
};

export const useMarkTodoDone = () => {
  const getToken = useGitlabTokenStore((store) => store.getApiToken);

  const markAsNotNew = useMarkTodoRead();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["todos"],
    mutationFn: async (todoId: number) => {
      const client = new Gitlab({ token: getToken() });
      return await client.TodoLists.done({ todoId });
    },
    onSuccess: (data) => {
      markAsNotNew(data);

      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};

function randomIntFromInterval({ min, max }: { min: number; max: number }) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
