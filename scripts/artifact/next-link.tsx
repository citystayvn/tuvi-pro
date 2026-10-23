/** Shim next/link cho bản artifact (một trang, định tuyến trong bộ nhớ). */
import * as React from "react";
import { navigate } from "./next-navigation";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const Link = React.forwardRef<HTMLAnchorElement, Props>(function Link({ href, onClick, ...rest }, ref) {
  return (
    <a
      ref={ref}
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
});
export default Link;
