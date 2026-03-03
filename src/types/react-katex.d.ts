declare module "react-katex" {
  import type { ComponentProps } from "react";

  interface KatexProps {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
  }

  export function InlineMath(props: KatexProps): React.JSX.Element;
  export function BlockMath(props: KatexProps): React.JSX.Element;
}
