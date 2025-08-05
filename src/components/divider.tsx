import clsx from "clsx";

interface DividerProps {
  className?: string;
  direction?: "horizontal" | "vertical";
}

export const Divider = ({
  className,
  direction = "horizontal",
}: DividerProps) => {
  const baseClass = clsx(
    direction === "horizontal" ? "h-px w-full" : "w-px h-full",
    "bg-neutral-100",
    className,
  );

  return <div className={baseClass} />;
};
