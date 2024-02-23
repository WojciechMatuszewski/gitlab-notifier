import { create } from "zustand";

import { Gitlab } from "@gitbeaker/rest";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  useSuspenseQuery
} from "@tanstack/react-query";
import { useEffect } from "react";
import { persist } from "zustand/middleware";
import { useMarkAsRead, useSetItems } from "./status";

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
        }
      };
    },
    {
      name: "gitlab-token-storage"
    }
  )
);

const client = new Gitlab({
  token: async () => {
    const token = useGitlabTokenStore.getState().apiToken;
    if (token.length <= 1) {
      throw new Error("Token not initialized");
    }

    return token;
  }
});

export const useGitlabToken = () => {
  const { apiToken, getApiToken, setApiToken } = useGitlabTokenStore();

  return {
    token: apiToken,
    getToken: getApiToken,
    setToken: setApiToken
  };
};

export const useFetchTodosSuspense = () => {
  return useSuspenseQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      return await client.TodoLists.all();
    }
  });
};

export const useFetchMRsSuspense = ({
  projectName
}: {
  projectName: string;
}) => {
  return useSuspenseQuery({
    queryKey: ["mergeRequests", projectName],
    queryFn: async () => {
      return await client.MergeRequests.all({
        projectId: projectName,
        state: "opened",
        sort: "desc",
        orderBy: "updated_at"
      });
    }
  });
};

export const usePoolMRs = ({ projectName }: { projectName: string }) => {
  const refetchInterval = randomIntFromInterval({
    min: 15_000,
    max: 45_000
  });

  const { token } = useGitlabToken();

  const { data: mergeRequests = [] } = useQuery({
    queryKey: ["mergeRequests", projectName],
    queryFn: async () => {
      return await client.MergeRequests.all({
        projectId: projectName,
        state: "opened",
        sort: "desc",
        orderBy: "updated_at"
      });
    },
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: true,
    enabled: token.length > 1
  });

  useQueries({
    queries: mergeRequests.map((mergeRequest) => {
      const refetchInterval = randomIntFromInterval({
        min: 15_000,
        max: 45_000
      });

      return {
        queryKey: ["mergeRequestNote", projectName, mergeRequest.iid],
        queryFn: () => {
          return client.MergeRequestNotes.all(projectName, mergeRequest.iid);
        },

        refetchInterval: refetchInterval,
        refetchInternalInBackground: true
      };
    })
  });
};

export const usePoolTodos = () => {
  const refetchInterval = randomIntFromInterval({ min: 15_000, max: 45_000 });

  const { token } = useGitlabToken();

  const { data: items = [], dataUpdatedAt } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      return await client.TodoLists.all();
    },
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: true,
    initialDataUpdatedAt: 0,
    throwOnError: false,
    enabled: token.length > 1,
    select: (todos) => {
      return todos.map((todo) => {
        return todo.id;
      });
    }
  });

  const setItems = useSetItems();

  useEffect(() => {
    if (dataUpdatedAt === 0) {
      return;
    }

    setItems(items);
  }, [dataUpdatedAt, items, setItems]);
};

export const useMarkTodoDone = () => {
  const getToken = useGitlabTokenStore((store) => store.getApiToken);

  const markAsNotNew = useMarkAsRead();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["todos"],
    mutationFn: async (todoId: number) => {
      const client = new Gitlab({ token: getToken() });
      return await client.TodoLists.done({ todoId });
    },
    onSuccess: (data) => {
      markAsNotNew(data.id);

      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
  });
};

function randomIntFromInterval({ min, max }: { min: number; max: number }) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
