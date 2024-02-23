import { GitbeakerRequestError } from "@gitbeaker/requester-utils";
import { Button, Heading, Text } from "@radix-ui/themes";
import { isObject } from "@sindresorhus/is";
import { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <section
      className={
        "p-4 flex flex-col h-full w-full content-center justify-center"
      }
    >
      <Heading color={"red"} className={"text-center"}>
        An error occurred
      </Heading>

      <div className={"mt-6 text-center mb-2"}>
        <Text color={"red"} className={"opacity-80 text-center"}>
          {errorMessageFromError(error)}
        </Text>
      </div>
      <Button onClick={() => resetErrorBoundary()}>Retry</Button>
    </section>
  );
}

function errorMessageFromError(error: unknown) {
  if (!isObject(error)) {
    return `${error}`;
  }

  if (error instanceof GitbeakerRequestError) {
    return error.cause?.description;
  }

  if ("message" in error) {
    return `${error.message}`;
  }

  return "Unknown error";
}
