"use client";

import useRoutes from "@/app/hooks/useRoutes";
import MobileItem from "./MobileItem";
import useConversation from "@/app/hooks/useConversation";

const MobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversation();
  if (isOpen) return null;

  return <div
  className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-white border-t-[1px] lg:hidden">
    {routes.map((routes) => (
      <MobileItem
        key={routes.label}
        href={routes.href}
        icon={routes.icon!}
        active={!!routes.active}
        onClick={routes.onClick}
      />
    ))}
  </div>;
};

export default MobileFooter;
