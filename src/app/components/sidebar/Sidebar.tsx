import getCurrentUser from "@/app/actions/getCurrentUser";
import DesktopSideBar from "./DesktopSideBar";
import MobileFooter from "./MobileFooter";
import { User } from "@prisma/client";

async function Sidebar({ children }: Readonly<{ children: React.ReactNode }>) {
  const currentUser: User | null = await getCurrentUser();

  return (
    <div className="h-full">
      <DesktopSideBar currentUser={currentUser} />
      <MobileFooter />
      <main className="lg:pl-20 h-full">{children}</main>
    </div>
  );
}

export default Sidebar;
