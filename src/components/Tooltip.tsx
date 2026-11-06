"use client";

import * as RadixTooltip from "@radix-ui/react-tooltip";
import cx from "classnames";

interface TooltipProps {
  children?: React.ReactNode;
  text?: string | React.ReactNode;
  asChild?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  text,
  asChild,
  position = "top",
  className,
  contentClassName,
}) => {
  return (
    <RadixTooltip.Provider delayDuration={500}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger className={cx(className)} asChild={asChild}>
          {children}
        </RadixTooltip.Trigger>
        <RadixTooltip.Content
          className={
            contentClassName ??
            "bg-zinc-700 text-white text-[12px] rounded-sm px-2 py-1 leading-none z-50"
          }
          side={position}
          sideOffset={5}
        >
          {text}
          <RadixTooltip.Arrow className="fill-darkGrey" offset={10} height={6} width={10} />
        </RadixTooltip.Content>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
