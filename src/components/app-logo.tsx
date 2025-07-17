import type { SVGProps } from "react";
import { PenSquare } from "lucide-react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return <PenSquare {...props} />;
}
