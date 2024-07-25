import clsx from "clsx";
import Link from "next/link";
import { FC } from "react";
import { IconType } from "react-icons";

interface MobileItemProps {
  icon: IconType;
  href: string;
  onClick?: () => void;
  active: boolean;
}

const MobileItem: FC<MobileItemProps> = ({
  icon: Icon,
  href,
  onClick,
  active,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={clsx(
        `group flex gap-x-3 text-sm leading-6 font-semibold w-full justify-center p-4 text-gray-500 hover:text-black hover:bg-gray-100`,
        active && "bg-gray-100 text-black",
      )}
    >
      <Icon className="w-6 h-6 shrink-0" />
    </Link>
  );
};

export default MobileItem;
