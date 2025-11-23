import { CheckIcon, MinusIcon } from "lucide-react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps,
} from "react-aria-components";
import clsx from "clsx";

export function Checkbox({ children, className, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox {...props} className={clsx("checkbox", className)}>
      {({ isIndeterminate, isSelected }) => (
        <>
          <div className="checkbox-box">
            {isIndeterminate ? (
              <MinusIcon aria-hidden size={12} />
            ) : isSelected ? (
              <CheckIcon aria-hidden size={12} />
            ) : null}
          </div>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}
