import { Server, Socket } from "socket.io";
import SocketToUserEmailMapper from "../SocketToUserEmailMapper";
import { ConversationCreateData } from "../socketHandler";
import { Conversation, User } from "@prisma/client";
import { FullConversationType } from "@/types";

const conversationCreateHandler = async (
  socketIdToUserEmailMapper: SocketToUserEmailMapper,
  socket: Socket,
  data: ConversationCreateData,
  io: Server,
) => {
  try {
    if (!socketIdToUserEmailMapper.has(socket)) {
      socket.disconnect();
      return;
    }

    const { userId, isGroup, members, name } = data;

    if (isGroup && (!members || members.length < 2 || !name)) {
      throw new Error("Invalid data");
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        email: socketIdToUserEmailMapper.get(socket),
      },
    });

    if (!currentUser) {
      socket.disconnect();
      return;
    }

    if (isGroup) {
      const newConversation = await prisma.conversation.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value,
              })),
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
          messages: {
            include: {
              seen: true,
              sender: true,
            },
          },
        },
      });

      emitNewConversationInfo(io, socketIdToUserEmailMapper, newConversation);
      return;
    }

    const existingConversations = await prisma.conversation.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId],
            },
          },
          {
            userIds: {
              equals: [userId, currentUser.id],
            },
          },
        ],
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
            sender: true,
          },
        },
      },
    });

    const singleConversation = existingConversations[0];

    if (singleConversation) {
      emitNewConversationInfo(
        io,
        socketIdToUserEmailMapper,
        singleConversation,
      );
      return;
    }

    const newConversation: FullConversationType =
      await prisma.conversation.create({
        data: {
          users: {
            connect: [
              {
                id: userId,
              },
              {
                id: currentUser.id,
              },
            ],
          },
        },
        include: {
          users: true,
          messages: {
            include: {
              seen: true,
              sender: true,
            },
          },
        },
      });

    emitNewConversationInfo(io, socketIdToUserEmailMapper, newConversation);
  } catch (error: any) {
    console.log(error, "ERROR_CONVERSATION_CREATE");
    io.to(socket.id).emit("error", "Error creating conversation");
  }
};

const emitNewConversationInfo = (
  io: Server,
  socketIdToUserEmailMapper: SocketToUserEmailMapper,
  newConversation: FullConversationType,
) => {
  newConversation.users.forEach((user) => {
    if (!socketIdToUserEmailMapper.has(user.email!)) {
      return;
    }
    const socketId = socketIdToUserEmailMapper.get(user.email!)!.id;
    io.to(socketId).emit("conversation:new", newConversation);
  });
};

export default conversationCreateHandler;
