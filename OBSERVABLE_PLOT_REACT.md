# Observable Plot + React Integration

## Two Official Approaches

### 1. Client-Side Rendering (Current Implementation)
**Use `useRef` + `useEffect`** - Recommended for browser rendering

```tsx
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (containerRef.current === null || data.length === 0) return;

  const plot = Plot.plot({/* options */});
  containerRef.current.append(plot);

  return () => plot.remove();
}, [data]);
```

**Benefits:**
- Works in browser without additional dependencies
- Better for complex plots and large datasets
- No serialization overhead

### 2. Server-Side Rendering with `toHyperScript()`
**Requires virtual DOM library** like `linkedom` or `jsdom`

```tsx
import {createElement as h} from "react";
import {parseHTML} from "linkedom";

const {document} = parseHTML("<!DOCTYPE html>");

export function PlotFigure({options}) {
  return Plot.plot({...options, document}).toHyperScript();
}
```

**Why it doesn't work with `new Document()`:**
- Browser's `new Document()` creates incomplete Document object
- Missing required properties like `ownerDocument`
- Only works with proper virtual DOM implementations

**When to use SSR:**
- Simple plots with small datasets
- Need to avoid page reflow
- Actual server-side rendering context

## Current Implementation
We use **client-side rendering** in `bore-plot.tsx`, `cpt-plot.tsx`, and `preexcavation-plot.tsx` because:
- No SSR setup with linkedom/jsdom
- Plots are rendered in the browser
- Follows official Observable Plot recommendations

## Sources
- [Observable Plot - Getting Started](https://observablehq.com/plot/getting-started)
- [Server-side rendering discussion](https://github.com/observablehq/plot/discussions/1759)
- [Observable Plot + React CodeSandbox](https://codesandbox.io/s/plot-react-f1jetw)
