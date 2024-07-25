import { useEffect, useState } from "react";
import useActiveList from "./useActiveList";
import { useSocket } from "../context/SocketProvider";

const useActiveChannel = () => {
  const { add, set, remove } = useActiveList();
  const { isConnected, socket } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewChannel = (data: string) => {
      add(data);
    };

    const handleRemoveChannel = (data: string) => {
      remove(data);
    };

    const handleSetChannel = (data: string[]) => {
      set(data);
    };

    socket.on("channel:add", handleNewChannel);
    socket.on("channel:remove", handleRemoveChannel);
    socket.on("channel:set", handleSetChannel);

    return () => {
      socket.off("channel:add", handleNewChannel);
      socket.off("channel:remove", handleRemoveChannel);
      socket.off("channel:set", handleSetChannel);
    };
  }, [socket, isConnected, add, remove, set]);
};

export default useActiveChannel;
