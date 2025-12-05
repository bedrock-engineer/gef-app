import { CheckIcon, CopyIcon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "react-aria-components";

interface CopyButtonProps {
  value: number | string;
  label?: string;
}

export function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [isPending, startTransition] = useTransition();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(String(value));
      startTransition(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      });
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }

  return (
    <Button
      aria-label={label}
      onPress={() => {
        handleCopy().catch(console.error);
      }}
      className="p-1 hover:bg-gray-200 data-pressed:bg-gray-300 data-pressed:text-gray-950 rounded transition-colors"
    >
      {isPending ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
    </Button>
  );
}
