import type { SVGProps } from "react";

import TafuriLogo from "@/icons/tafuriLogo.svg";
import Notification from "@/icons/notification.svg";

// Utility type for props
type IconBaseProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

// Export each icon as its own functional component
export const TafuriLogoIcon = ({ className = "", ...rest }: IconBaseProps) => (
  <TafuriLogo className={className} {...rest} />
);

export const NotificationIcon = ({
  className = "",
  ...rest
}: IconBaseProps) => <Notification className={className} {...rest} />;
