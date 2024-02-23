import { TodoSchema } from "@gitbeaker/rest";
import { CheckIcon, CheckboxIcon } from "@radix-ui/react-icons";
import { Avatar, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import dayjs from "dayjs";
import { useFetchTodosSuspense, useMarkTodoDone } from "../lib/gitlab";
import { useIsUnread, useMarkAsRead } from "../lib/status";
import { EmptyState } from "./EmptyState";

export function Todos() {
  const { data: todos } = useFetchTodosSuspense();

  if (todos.length === 0) {
    return <EmptyState icon={CheckboxIcon}>All done!</EmptyState>;
  }

  return (
    <section>
      <ul className={"list"}>
        {todos.map((todo) => {
          return <TodosListItem key={todo.id} todo={todo} />;
        })}
      </ul>
    </section>
  );
}

function TodosListItem({ todo }: { todo: TodoSchema }) {
  const isUnread = useIsUnread(todo.id);

  return (
    <li
      data-unread={isUnread}
      className={
        "hover:bg-[var(--accent-4)] list-item data-[unread=true]:bg-[var(--accent-1)] border-b-[1px] border-b-[var(--gray-6)] px-2 py-1"
      }
    >
      <TodoItem todo={todo} />
    </li>
  );
}

function TodoItem({ todo }: { todo: TodoSchema }) {
  const markAsNotNew = useMarkAsRead();

  return (
    <Flex asChild={true} className={"flex-col"}>
      <a
        href={todo.target_url}
        className={"max-w-full min-w-0 flex flex-col"}
        target={"_blank"}
        onClick={() => {
          markAsNotNew(todo.id);
        }}
      >
        <Flex className={"flex-row align-baseline gap-2 justify-between"}>
          <TodoTitle todo={todo} />
          <TodoCreatedAt todo={todo} />
        </Flex>
        <Flex className={"flex-row justify-between items-center"}>
          <div className={"flex flex-col self-top items-top gap-1"}>
            <TodoTodo todo={todo} />
            <TodoAuthor todo={todo} />
          </div>
          <TodoAction todoId={todo.id} />
        </Flex>
      </a>
    </Flex>
  );
}

function TodoTitle({ todo }: { todo: TodoSchema }) {
  const isUnread = useIsUnread(todo.id);

  const title = todo.target.title;
  if (typeof title !== "string") {
    throw new Error("Integrity issue: `todo.target.title` is not a string");
  }

  return (
    <Text
      as="span"
      color={"indigo"}
      size={"2"}
      weight={isUnread ? "bold" : "medium"}
      className={"whitespace-nowrap overflow-hidden text-ellipsis"}
    >
      {title}
    </Text>
  );
}

function TodoAuthor({ todo }: { todo: TodoSchema }) {
  return (
    <Flex
      gap={"2"}
      align={"center"}
      className={"relative shrink-999 min-w-[80px]"}
    >
      <Avatar
        src={todo.author.avatar_url}
        fallback={todo.author.name}
        radius={"full"}
        className={"shrink-0 w-[16px] h-[16px]"}
      />
      <Text
        as="span"
        size={"1"}
        className={"whitespace-nowrap overflow-hidden text-ellipsis mb-[1px]"}
      >
        {todo.author.name}
      </Text>
    </Flex>
  );
}

function TodoTodo({ todo }: { todo: TodoSchema }) {
  const actionName = todo.action_name as
    | TodoSchema["action_name"]
    | "review_requested";

  switch (actionName) {
    case "review_requested": {
      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis  min-w-[40px]"
          }
        >
          Assigned you for review
        </Text>
      );
    }
    case "assigned": {
      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis  min-w-[40px]"
          }
        >
          Assigned you for review
        </Text>
      );
    }
    case "approval_required": {
      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis  min-w-[40px]"
          }
        >
          Your approval is required
        </Text>
      );
    }
    case "build_failed": {
      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis  min-w-[40px]"
          }
        >
          Build failed
        </Text>
      );
    }
    case "directly_addressed": {
      const text = todo.body;

      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis min-w-[40px]"
          }
        >
          {text}
        </Text>
      );
    }
    case "marked": {
      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis min-w-[40px]"
          }
        >
          Marked
        </Text>
      );
    }
    case "mentioned": {
      const text = todo.target.body;
      if (typeof text !== "string") {
        throw new Error(
          "Integrity issue: `todo.target.body` is not a string for `mentioned` todo"
        );
      }

      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis min-w-[40px]"
          }
        >
          {text}
        </Text>
      );
    }
    case "merge_train_removed": {
      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis min-w-[40px]"
          }
        >
          Merge train removed
        </Text>
      );
    }
    case "unmergeable": {
      return (
        <Text
          as="span"
          size={"1"}
          className={
            "whitespace-nowrap overflow-hidden text-ellipsis min-w-[40px]"
          }
        >
          Unmergable
        </Text>
      );
    }
  }
}

function TodoCreatedAt({ todo }: { todo: TodoSchema }) {
  return (
    <Text size={"1"} color={"gray"} className={"whitespace-nowrap"}>
      {dayjs().to(todo.created_at)}
    </Text>
  );
}

function TodoAction({ todoId }: { todoId: number }) {
  const { mutate } = useMarkTodoDone();

  return (
    <form
      onKeyUp={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();

        mutate(todoId);
      }}
    >
      <fieldset>
        <Tooltip content={"Mark as done"}>
          <IconButton color={"green"}>
            <CheckIcon />
          </IconButton>
        </Tooltip>
      </fieldset>
    </form>
  );
}
