"use client";

import Avatar from "@/app/components/Avatar";
import LoadingModal from "@/app/components/LoadingModal";
import { useSocket } from "@/app/context/SocketProvider";
import useSocketTwoWayConversation from "@/app/hooks/useSocketTwoWayConversation";
import { FullConversationType } from "@/types";
import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useCallback, useState } from "react";
import toast from "react-hot-toast";

interface UserBoxProps {
  user: User;
}

const UserBox: FC<UserBoxProps> = ({ user }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, socket } = useSocket();
  const { emitter } = useSocketTwoWayConversation<
    { userId: string },
    FullConversationType
  >(socket, "conversationCreate", "conversation:new");

  const handleOnClick = useCallback(() => {
    setIsLoading(true);

    if (!socket || !isConnected) {
      toast.error("Socket not connected");
      setIsLoading(false);
      return;
    }

    emitter({ userId: user.id })
      ?.then((data) => {
        router.push(`/conversations/${data.id}`);
      })
      .finally(() => setIsLoading(false));
  }, [emitter, router, socket, user.id, isConnected]);

  return (
    <>
      <div
        className="w-full relative flex items-center space-x-3 bg-white p-3 hover:bg-neutral-100 rounded-lg transition cursor-pointer"
        onClick={handleOnClick}
      >
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="focus:outline-none">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-medium text-neutral-900">
                {user.name}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserBox;
