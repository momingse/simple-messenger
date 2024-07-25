import { FullConversationType } from "@/types";
import getConversations from "../actions/getConversations";
import Sidebar from "../components/sidebar/Sidebar";
import ConversationList from "./components/ConversationList";
import getUsers from "../actions/getUsers";

export default async function ConverstaionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations: FullConversationType[] = await getConversations();
  const users = await getUsers();

  return (
    <Sidebar>
      <ConversationList initialList={conversations} users={users} />
      <div className="h-full">{children}</div>
    </Sidebar>
  );
}
