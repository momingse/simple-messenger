import { Server, Socket } from "socket.io";
import { MessageData } from "../socketHandler";
import SocketToUserEmailMapper from "../SocketToUserEmailMapper";

const messageHandler = async (
  socketIdToUserMap: SocketToUserEmailMapper,
  socket: Socket,
  data: MessageData,
  io: Server,
) => {
  try {
    if (!socketIdToUserMap.has(socket)) {
      socket.disconnect();
      return;
    }
    const { message, image, conversationId } = data;

    const currentUser = await prisma.user.findUnique({
      where: {
        email: socketIdToUserMap.get(socket),
      },
    });

    if (!currentUser) {
      socket.disconnect();
      return;
    }

    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image: image,
        conversation: {
          connect: {
            id: conversationId,
          },
        },
        sender: {
          connect: {
            id: currentUser.id,
          },
        },
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
      include: {
        seen: true,
        sender: true,
      },
    });

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    updatedConversation.users.forEach((user) => {
      if (!socketIdToUserMap.has(user.email ?? "")) return;
      const socketId = socketIdToUserMap.get(user.email!)!.id;
      io.to(socketId).emit(`messages:new:${conversationId}`, newMessage);
      io.to(socketId).emit("conversation:update", {
        id: conversationId,
        messages: [newMessage],
      });
    });

    const lastMessage =
      updatedConversation.messages[updatedConversation.messages.length - 1];
  } catch (error) {
    console.log(error, "ERROR_MESSAGE");
    io.to(socket.id).emit("error", "Fail to send message");
  }
};

export default messageHandler;
