import { Server, Socket } from "socket.io";
import SocketToUserEmailMapper from "../SocketToUserEmailMapper";
import { ConversationDeleteData } from "../socketHandler";

const conversationDeleteHandler = async (
  socketIdToUserMap: SocketToUserEmailMapper,
  socket: Socket,
  data: ConversationDeleteData,
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

    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        users: true,
      },
    });

    if (!existingConversation) {
      throw new Error("Conversation not found");
    }

    const deletedConversation = await prisma.conversation.delete({
      where: {
        id: conversationId,
        userIds: {
          hasSome: [currentUser.id],
        },
      },
    });

    existingConversation.users.forEach((user) => {
      if (!socketIdToUserMap.has(user.email ?? "")) return;
      const socketId = socketIdToUserMap.get(user.email!)!.id;
      io.to(socketId).emit("conversation:remove", existingConversation);
    });
  } catch (error: any) {
    console.log(error, "ERROR_CONVERSATION_DELETE");
    io.to(socket.id).emit("error", "Failed to delete conversation");
  }
};

export default conversationDeleteHandler;
