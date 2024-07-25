import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToasterContext from "./context/ToasterContext";
import AuthContext from "./context/AuthContext";
import { SocketProvider } from "./context/SocketProvider";
import ActiveStatus from "./components/ActiveStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Messenger Clone",
  description: "A clone of the Facebook Messenger app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext>
          <SocketProvider>
            <ToasterContext />
            <ActiveStatus />
            {children}
          </SocketProvider>
        </AuthContext>
      </body>
    </html>
  );
}
