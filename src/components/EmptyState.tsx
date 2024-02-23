import { IconProps } from "@radix-ui/react-icons/dist/types";
import { Flex, Heading } from "@radix-ui/themes";

export function EmptyState({
  icon: Icon,
  children
}: {
  icon: (props: IconProps) => React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Flex asChild={true} className={"flex-col items-center mt-8 gap-2"}>
      <section>
        <Icon className={"w-16 h-16 text-[var(--gray-6)]"} />
        <Heading className={"text-[var(--gray-6)]"} size={"7"}>
          {children}
        </Heading>
      </section>
    </Flex>
  );
}
