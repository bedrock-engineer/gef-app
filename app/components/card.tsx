import type { PropsWithChildren } from "react";

export const Card = (props: PropsWithChildren) => (
  <div className="bg-white border border-gray-300 rounded-sm p-6" {...props} />
);

export const CardTitle = (props: PropsWithChildren) => (
  <h3 className="text-lg font-semibold mb-4" {...props} />
);
