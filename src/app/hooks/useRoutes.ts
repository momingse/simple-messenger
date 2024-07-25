import { usePathname } from "next/navigation";
import useConversation from "./useConversation";
import { useMemo } from "react";
import { HiChat, HiUsers } from "react-icons/hi";
import { HiArrowLeftOnRectangle } from "react-icons/hi2";
import { signOut } from "next-auth/react";
import { useSocket } from "../context/SocketProvider";

const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();
  const { socket } = useSocket();

  const routes = useMemo(
    () => [
      {
        label: "Chat",
        href: "/conversations",
        icon: HiChat,
        active: pathname === "/conversations" && !conversationId,
      },
      {
        label: "Users",
        href: "/users",
        icon: HiUsers,
        active: pathname === "/users",
      },
      {
        label: "Logout",
        href: "#",
        onClick: () => {
          socket?.disconnect();
          signOut();
        },
        icon: HiArrowLeftOnRectangle,
      },
    ],
    [pathname, conversationId, socket],
  );

  return routes;
};

export default useRoutes;
