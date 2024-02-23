import {
  Button,
  Code,
  Flex,
  Heading,
  Link,
  Strong,
  Text,
  TextField
} from "@radix-ui/themes";
import { FormEventHandler, Fragment, useId } from "react";
import { object, parse, string } from "valibot";
import { useGitlabToken } from "../lib/gitlab";
import { useFadeToggle } from "../lib/useFadeToggle";

const FormPayloadSchema = object({
  apiToken: string()
});

export function TokenForm() {
  const { setToken, token } = useGitlabToken();

  const { fadeToggle, isAnimating, ref } = useFadeToggle();

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const { apiToken } = parse(
      FormPayloadSchema,
      Object.fromEntries(new FormData(event.currentTarget).entries())
    );

    setToken(apiToken);

    void fadeToggle();
  };

  const inputId = useId();
  return (
    <Fragment>
      <section className={"self-center mx-auto p-4"}>
        <form onSubmit={onSubmit}>
          <fieldset className={"mb-2"}>
            <Heading asChild={true} size={"4"}>
              <legend>Set your Gitlab API Token</legend>
            </Heading>
            <Description />
            <Flex direction={"column"} gap={"3"} mt={"5"}>
              <Text as="label" size={"2"} weight={"bold"} htmlFor={inputId}>
                Gitlab API Token
              </Text>
              <TextField.Root>
                <TextField.Input
                  type={"text"}
                  defaultValue={token}
                  size={"2"}
                  required={true}
                  min={1}
                  name="apiToken"
                  id={inputId}
                />
              </TextField.Root>
              <Button
                color="green"
                size={"2"}
                className={"grid place-content-center"}
              >
                <span
                  ref={ref}
                  aria-hidden={!isAnimating}
                  style={{ opacity: 0 }}
                  className={"row-[1] col-[1] text-center"}
                >
                  Token saved!
                </span>
                <span
                  aria-hidden={isAnimating}
                  style={{ opacity: isAnimating ? 0 : 1 }}
                  className={"row-[1] col-[1] text-center"}
                >
                  Save
                </span>
              </Button>
            </Flex>
          </fieldset>
        </form>
      </section>
    </Fragment>
  );
}

function Description({}) {
  return (
    <Text as="p" size={"2"}>
      If you have not already, generate the{" "}
      <Link
        href="https://gitlab.com/-/user_settings/personal_access_tokens"
        target={"_blank"}
      >
        token here
      </Link>
      .{" "}
      <Strong>
        Make sure to select the <Code>read</Code> scope
      </Strong>
      .
    </Text>
  );
}
