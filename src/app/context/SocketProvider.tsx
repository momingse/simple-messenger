"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import LoadingModal from "../components/LoadingModal";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (!session.data?.user?.email) return;
    const socketInstance = io();
    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.emit("register", {
      email: session.data.user.email,
    });

    socketInstance.on("error", (error: string) => {
      toast.error(error);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session.data?.user?.email]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {!isConnected && session?.data?.user && <LoadingModal />}
      {children}
    </SocketContext.Provider>
  );
};
