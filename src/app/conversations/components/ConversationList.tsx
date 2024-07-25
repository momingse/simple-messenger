"use client";

import { FullConversationType, FullMessageType } from "@/types";
import { Conversation, User } from "@prisma/client";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import ConversationBox from "./ConversationBox";
import useConversation from "@/app/hooks/useConversation";
import GroupChatModal from "./GroupChatModel";
import { useSocket } from "@/app/context/SocketProvider";

interface ConversationListProps {
  initialList: FullConversationType[];
  users: User[];
}

const ConversationList: FC<ConversationListProps> = ({
  initialList,
  users,
}) => {
  const [items, setItems] = useState<FullConversationType[]>(initialList);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const { socket, isConnected } = useSocket();

  const router = useRouter();

  const { conversationId, isOpen } = useConversation();

  useEffect(() => {
    if (!socket || !isConnected) return;
    const handleNewConversation = (data: FullConversationType) => {
      setItems((prev) => {
        if (prev.some((item) => item.id === data.id)) return prev;
        return [...prev, data];
      });
    };

    const handleUpdateConversation = (data: {
      id: string;
      messages: FullMessageType[];
    }) => {
      setItems((prev) => {
        return prev.map((item) => {
          if (item.id === data.id) {
            return {
              ...item,
              messages: data.messages,
            };
          }
          return item;
        });
      });
    };

    const handleDeleteConversation = (data: FullConversationType) => {
      setItems((prev) => {
        return prev.filter((item) => item.id !== data.id);
      });

      if (conversationId === data.id) router.push("/conversations");
    };

    socket.on("conversation:new", handleNewConversation);
    socket.on("conversation:update", handleUpdateConversation);
    socket.on("conversation:remove", handleDeleteConversation);

    return () => {
      socket.off("conversation:new", handleNewConversation);
      socket.off("conversation:update", handleUpdateConversation);
      socket.off("conversation:remove", handleDeleteConversation);
    };
  }, [socket, isConnected, conversationId, router]);

  return (
    <>
      <GroupChatModal
        users={users}
        isOpen={isModelOpen}
        onClose={() => setIsModelOpen(false)}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200",
          isOpen ? "hidden" : "block w-full left-0",
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800">Messages</div>
            <div
              onClick={() => setIsModelOpen(true)}
              className="flex self-center rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
            >
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          {items.map((item) => (
            <ConversationBox
              key={item.id}
              data={item}
              selected={conversationId === item.id}
            />
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
