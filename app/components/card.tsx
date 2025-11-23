import type { PropsWithChildren } from "react";

export const Card = (props: PropsWithChildren) => (
  <div
    className="bg-white border border-gray-300 rounded-lg shadow-sm p-6"
    {...props}
  />
);
