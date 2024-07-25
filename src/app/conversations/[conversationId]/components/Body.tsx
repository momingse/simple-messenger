"use client";

import { useSocket } from "@/app/context/SocketProvider";
import useConversation from "@/app/hooks/useConversation";
import { FullMessageType } from "@/types";
import axios from "axios";
import { FC, useEffect, useRef, useState } from "react";
import MessageBox from "./MessageBox";
import { Play } from "next/font/google";
import { useSession } from "next-auth/react";

interface BodyProps {
  initialMessages: FullMessageType[];
}

const Body: FC<BodyProps> = ({ initialMessages }) => {
  const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { isConnected, socket } = useSocket();
  const session = useSession();

  const { conversationId } = useConversation();

  useEffect(() => {
    bottomRef?.current?.scrollIntoView();

    if (!socket || !isConnected || !bottomRef.current) return;

    const handleNewMessage = (data: FullMessageType) => {
      setMessages((prev) => {
        if (prev.some((msg) => msg.id === data.id)) return prev;
        return [...prev, data];
      });

      bottomRef?.current?.scrollIntoView();
      if (session.data?.user?.email === data.sender.email) return;
      socket.emit("conversationSeen", { conversationId });
    };

    const handleUpdateMessage = (data: FullMessageType) => {
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === data.id) {
            return data;
          }
          return msg;
        });
      });
    };

    socket.on(`messages:new:${conversationId}`, handleNewMessage);
    socket.on(`message:update:${conversationId}`, handleUpdateMessage);

    return () => {
      socket.off(`messages:new:${conversationId}`, handleNewMessage);
      socket.off(`message:update:${conversationId}`, handleUpdateMessage);
    };
  }, [socket, isConnected, conversationId, session.data?.user?.email]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("conversationSeen", { conversationId });
  }, [socket, conversationId]);

  return (
    <div className="flex-1 overflow-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
        />
      ))}
      <div ref={bottomRef} className="pt-24" />
    </div>
  );
};

export default Body;
