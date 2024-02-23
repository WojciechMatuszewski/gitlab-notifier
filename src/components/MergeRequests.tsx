import { MergeRequestSchemaWithBasicLabels } from "@gitbeaker/rest";
import { RocketIcon } from "@radix-ui/react-icons";
import { Avatar, Flex, Text } from "@radix-ui/themes";
import dayjs from "dayjs";
import { useFetchMRsSuspense } from "../lib/gitlab";
import { EmptyState } from "./EmptyState";

export function MergeRequests() {
  const { data: mergeRequests } = useFetchMRsSuspense({
    projectName: import.meta.env.VITE_GITLAB_PROJECT_NAME
  });

  if (mergeRequests.length === 0) {
    return <EmptyState icon={RocketIcon}>No MRs</EmptyState>;
  }

  return (
    <section>
      <ul className={"list"}>
        {mergeRequests.map((mr) => {
          return <MergeRequestsListItem key={mr.id} mr={mr} />;
        })}
      </ul>
    </section>
  );
}

function MergeRequestsListItem({
  mr
}: {
  mr: MergeRequestSchemaWithBasicLabels;
}) {
  return (
    <li
      className={
        "hover:bg-[var(--accent-4)] border-b-[1px] border-b-[var(--gray-6)] px-2 py-1"
      }
    >
      <MergeRequestItem mr={mr} />
    </li>
  );
}

function MergeRequestItem({ mr }: { mr: MergeRequestSchemaWithBasicLabels }) {
  return (
    <Flex asChild={true} className={"flex-col gap-1"}>
      <a href={mr.web_url} target={"_blank"}>
        <Flex className={"justify-between align-top gap-2"}>
          <MergeRequestTitle mr={mr} />
          <MergeRequestCreatedAt mr={mr} />
        </Flex>
        <MergeRequestAuthor mr={mr} />
      </a>
    </Flex>
  );
}

function MergeRequestTitle({ mr }: { mr: MergeRequestSchemaWithBasicLabels }) {
  return (
    <Text
      as="span"
      color={"indigo"}
      size={"2"}
      weight={"medium"}
      className={"whitespace-nowrap overflow-hidden text-ellipsis"}
    >
      {mr.title}
    </Text>
  );
}

function MergeRequestCreatedAt({
  mr
}: {
  mr: MergeRequestSchemaWithBasicLabels;
}) {
  return (
    <Text size={"1"} color={"gray"} className={"whitespace-nowrap"}>
      {dayjs().to(mr.created_at, true)}
    </Text>
  );
}

function MergeRequestAuthor({ mr }: { mr: MergeRequestSchemaWithBasicLabels }) {
  return (
    <Flex
      gap={"2"}
      align={"center"}
      className={"relative shrink-999 min-w-[80px]"}
    >
      <Avatar
        src={mr.author.avatar_url}
        fallback={mr.author.name}
        radius={"full"}
        className={"shrink-0 w-[16px] h-[16px]"}
      />
      <Text
        as="span"
        size={"1"}
        className={"whitespace-nowrap overflow-hidden text-ellipsis mb-[1px]"}
      >
        {mr.author.name}
      </Text>
    </Flex>
  );
}
