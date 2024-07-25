import { Server, Socket } from "socket.io";
import { ConversationSeenData } from "../socketHandler";
import SocketToUserEmailMapper from "../SocketToUserEmailMapper";

const conversationSeenHandler = async (
  socketIdToUserMap: SocketToUserEmailMapper,
  socket: Socket,
  data: ConversationSeenData,
  io: Server,
) => {
  try {
    if (!socketIdToUserMap.has(socket)) {
      socket.disconnect();
      return;
    }
    const { conversationId } = data;

    const currentUser = await prisma.user.findUnique({
      where: {
        email: socketIdToUserMap.get(socket),
      },
    });

    if (!currentUser) {
      socket.disconnect();
      return;
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        messages: {
          include: {
            seen: true,
          },
        },
        users: true,
      },
    });

    if (!conversation) {
      return;
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!lastMessage) {
      return;
    }

    const updatedMessage = await prisma.message.update({
      where: {
        id: lastMessage.id,
      },
      include: {
        seen: true,
        sender: true,
      },
      data: {
        seen: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    conversation.users.forEach((user) => {
      if (!socketIdToUserMap.has(user.email ?? "")) return;
      const socketId = socketIdToUserMap.get(user.email!)!.id;
      io.to(socketId).emit("conversation:update", {
        id: conversationId,
        messages: [updatedMessage],
      });
    });

    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) return;

    conversation.users.forEach((user) => {
      if (!socketIdToUserMap.has(user.email ?? "")) return;
      const socketId = socketIdToUserMap.get(user.email!)!.id;
      io.to(socketId).emit(`message:update:${conversationId}`, updatedMessage);
    });
  } catch (error) {
    console.log(error, "ERROR_MESSAGE_SEEN");
    io.to(socket.id).emit("error", "Failed to mark message as seen");
  }
};

export default conversationSeenHandler;
