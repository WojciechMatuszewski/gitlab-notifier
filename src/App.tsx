import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ErrorFallback";
import { MergeRequests } from "./components/MergeRequests";
import { Spinner } from "./components/Spinner";
import { Tabs } from "./components/Tabs";
import { Todos } from "./components/Todos";
import { useGitlabToken } from "./lib/gitlab";
import { Settings } from "./components/Settings";

function App() {
  const { token } = useGitlabToken();

  return (
    <Tabs
      Todos={
        <QueryErrorResetBoundary>
          {({ reset }) => {
            return (
              <ErrorBoundary
                FallbackComponent={ErrorFallback}
                onReset={reset}
                resetKeys={[token]}
              >
                <Suspense fallback={<Spinner />}>
                  <Todos />
                </Suspense>
              </ErrorBoundary>
            );
          }}
        </QueryErrorResetBoundary>
      }
      MergeRequests={
        <Suspense fallback={<Spinner />}>
          <MergeRequests />
        </Suspense>
      }
      Settings={
        <Suspense fallback={<Spinner />}>
          <Settings />
        </Suspense>
      }
    />
  );
}

export default App;
