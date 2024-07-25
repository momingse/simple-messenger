import { useCallback, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

const useSocketTwoWayConversation = <U, T>(
  socket: Socket | null,
  emit: string,
  on: string,
  timeout: number = 5000,
) => {
  const resolveRef = useRef<((value: any) => void) | null>(null);

  const emitter = useCallback(
    (data: U) => {
      if (!socket || !socket.connected) return Promise.reject(null);
      socket.emit(emit, data);
      return new Promise<T>((resolve, reject) => {
        resolveRef.current = resolve;
        const timeoutFunc = setTimeout(() => {
          resolveRef.current = null;
          reject("Timeout");
        }, timeout);
      });
    },
    [socket, emit, timeout],
  );

  useEffect(() => {
    if (!socket) return;

    const handleData = (receivedData: T) => {
      if (resolveRef.current) {
        resolveRef.current(receivedData);
        resolveRef.current = null;
      }
    };

    socket.on(on, handleData);

    return () => {
      socket.off(on, handleData);
    };
  }, [socket, on]);

  return { emitter };
};

export default useSocketTwoWayConversation;
