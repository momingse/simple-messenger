import { Server } from "socket.io";
import conversationCreateHandler from "./handler/conversationCreateHandler";
import conversationSeenHandler from "./handler/conversationSeenHandler";
import messageHandler from "./handler/messageHandler";
import registerHandler from "./handler/registerHandler";
import SocketToUserEmailMapper from "./SocketToUserEmailMapper";
import conversationDeleteHandler from "./handler/conversationDeleteHandler";

export type RegisterData = {
  email: string;
};

export type MessageData = {
  message: string;
  image?: string;
  conversationId: string;
};

export type ConversationSeenData = {
  conversationId: string;
};

export type ConversationCreateData = {
  userId: string;
  isGroup: boolean;
  members: { value: string }[];
  name: string;
};

export type ConversationDeleteData = {
  conversationId: string;
};

const socketHandler = (io: Server) => {
  const socketToUserEmailMapper = new SocketToUserEmailMapper();

  io.on("connection", (socket) => {
    console.log(`a user connected: ${socket.id}`);

    socket.on("register", (data: RegisterData) => {
      registerHandler(socketToUserEmailMapper, socket, data, io);
    });

    socket.on("message", (data: MessageData) => {
      messageHandler(socketToUserEmailMapper, socket, data, io);
    });

    socket.on("conversationCreate", (data: ConversationCreateData) => {
      conversationCreateHandler(socketToUserEmailMapper, socket, data, io);
    });

    socket.on("conversationSeen", (data: ConversationSeenData) => {
      conversationSeenHandler(socketToUserEmailMapper, socket, data, io);
    });

    socket.on("conversationDelete", (data: ConversationDeleteData) => {
      conversationDeleteHandler(socketToUserEmailMapper, socket, data, io);
    });

    socket.on("disconnect", () => {
      Array.from(socketToUserEmailMapper.getSockets())
        .filter((onlineUserSocket) => onlineUserSocket.id !== socket.id)
        .forEach((onlineUserSocket) => {
          io.to(onlineUserSocket.id).emit(
            "channel:remove",
            socketToUserEmailMapper.get(socket),
          );
        });
      socketToUserEmailMapper.delete(socket);
      console.log(`a user disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler;
