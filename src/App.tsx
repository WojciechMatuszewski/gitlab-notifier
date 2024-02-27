import { Nav } from "./components/Nav.tsx";
import { useGitlabToken } from "./lib/gitlab";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ErrorFallback.tsx";
import { ReactNode, Suspense } from "react";
import { Spinner } from "./components/Spinner.tsx";
import { Todos } from "./components/Todos.tsx";
import { MergeRequests } from "./components/MergeRequests.tsx";
import { Settings } from "./components/Settings.tsx";

function App() {
  const { token } = useGitlabToken();
  const hasTokenSet = token.length > 1;

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route
          index={true}
          element={
            hasTokenSet ? <Navigate to="/todos" /> : <Navigate to="/settings" />
          }
        />
        <Route
          path={"/todos"}
          element={
            <ErrorBoundary>
              <Todos />
            </ErrorBoundary>
          }
        />
        <Route
          path={"/mrs"}
          element={
            <ErrorBoundary>
              <MergeRequests />
            </ErrorBoundary>
          }
        />
        <Route
          path={"/settings"}
          element={
            <Suspense fallback={<Spinner />}>
              <Settings />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function ErrorBoundary({ children }: { children: ReactNode }) {
  const token = useGitlabToken();

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => {
        return (
          <ReactErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={reset}
            resetKeys={[token]}
          >
            <Suspense fallback={<Spinner />}>{children}</Suspense>
          </ReactErrorBoundary>
        );
      }}
    </QueryErrorResetBoundary>
  );
}

export default App;
