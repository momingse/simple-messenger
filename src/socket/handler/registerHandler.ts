import { Server, Socket } from "socket.io";
import { RegisterData } from "../socketHandler";
import SocketToUserEmailMapper from "../SocketToUserEmailMapper";

const registerHandler = async (
  socketIdToUserMap: SocketToUserEmailMapper,
  socket: Socket,
  data: RegisterData,
  io: Server,
) => {
  if (socketIdToUserMap.has(socket)) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    socket.disconnect();
    return;
  }


  io.to(socket.id).emit(
    "channel:set",
    Array.from(socketIdToUserMap.getEmails()),
  );

  Array.from(socketIdToUserMap.getSockets()).forEach((onlineUserSocket) => {
    io.to(onlineUserSocket.id).emit("channel:add", data.email);
  });

  socketIdToUserMap.set(socket, data.email);
  console.log(`user registered: ${data.email}`);
};

export default registerHandler;
