declare module "svg-crowbar" {
  interface Options {
    css: "inline" | "internal" | "none";
  }

  interface PNGOptions extends Options {
    downloadPNGOptions?: { scale: number };
  }

  export function downloadPng(
    source: SVGElement,
    title?: string,
    options?: PNGOptions,
  ): undefined;
  export function downloadSvg(
    source: SVGElement,
    title?: string,
    options?: Options,
  ): undefined;
}
