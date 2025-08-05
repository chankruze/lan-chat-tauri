import clsx from "clsx";
import React from "react";

export const Action = ({
  icon,
  label,
  action,
  iconWrapperStyles,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  iconWrapperStyles: string;
  disabled?: boolean;
}) => {
  return (
    <div className="space-y-2 cursor-pointer flex flex-col items-center">
      <button
        disabled={disabled}
        onClick={action}
        className={clsx(
          "p-4 rounded-full flex items-center justify-center",
          "transition-colors duration-200 hover:bg-opacity-80",
          iconWrapperStyles,
          { "opacity-50 cursor-not-allowed": disabled },
        )}
      >
        {icon}
      </button>
      <p
        className={clsx("text-xs font-medium", {
          "text-neutral-400": disabled,
        })}
      >
        {label}
      </p>
    </div>
  );
};
