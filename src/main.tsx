import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

import "@radix-ui/themes/styles.css";
import { usePoolTodos as usePollTodos, usePoolMRs } from "./lib/gitlab";
import "./style.css";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1m",
    MM: "%dm",
    y: "1y",
    yy: "%dy"
  }
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchInterval: 0,
      refetchIntervalInBackground: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false
    }
  }
});

async function enableMocking() {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  const { worker } = await import("./mocks/browser");
  return worker.start();
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Theme className={"min-h-full"}>
          <App />
          <DataPooler />
        </Theme>
      </QueryClientProvider>
    </React.StrictMode>
  );
});

function DataPooler() {
  usePollTodos();

  usePoolMRs({ projectName: import.meta.env.VITE_GITLAB_PROJECT_NAME });

  return null;
}
