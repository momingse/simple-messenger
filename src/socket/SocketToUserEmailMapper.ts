import { type } from "os";
import { Socket } from "socket.io";

type OutputType<T> = T extends string ? Socket : string;

class SocketToUserEmailMapper {
  private SocketIdToEmail: WeakMap<Socket, string>;
  private UserEmailToSocket: Map<string, Socket>;

  constructor() {
    this.SocketIdToEmail = new WeakMap();
    this.UserEmailToSocket = new Map();
  }

  public set(socket: Socket, email: string) {
    this.SocketIdToEmail.set(socket, email);
    this.UserEmailToSocket.set(email, socket);
  }

  public get<T extends string | Socket>(input: T): OutputType<T> | undefined {
    if (typeof input === "string") {
      return this.UserEmailToSocket.get(input) as OutputType<T> | undefined;
    }

    return this.SocketIdToEmail.get(input) as OutputType<T> | undefined;
  }

  public delete(input: Socket) {
    const email = this.SocketIdToEmail.get(input);
    if (!email) {
      return;
    }
    this.SocketIdToEmail.delete(input);
    this.UserEmailToSocket.delete(email);
  }

  public has(input: Socket | string) {
    if (typeof input === "string") {
      return this.UserEmailToSocket.has(input);
    }

    return this.SocketIdToEmail.has(input);
  }

  public clear() {
    this.UserEmailToSocket.clear();
  }

  public getEmails() {
    return this.UserEmailToSocket.keys();
  }

  public getSockets() {
    return this.UserEmailToSocket.values();
  }

  public get size() {
    return this.UserEmailToSocket.size;
  }

  public get entries() {
    return this.UserEmailToSocket.entries();
  }
}

export default SocketToUserEmailMapper;
