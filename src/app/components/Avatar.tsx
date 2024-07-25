"use strict";

import { User } from "@prisma/client";
import Image from "next/image";
import { FC } from "react";
import useActiveList from "../hooks/useActiveList";

interface AvatarProps {
  user: User | null;
}

const Avatar: FC<AvatarProps> = ({ user }) => {
  const { members } = useActiveList();
  const isActive = members.some((member) => member === user?.email);

  return (
    <div className="relative">
      <div className="relative inline-block rounded-full overflow-hidden h-9 w-9 md:h-11 md:w-11">
        <Image
          alt="avatar"
          src={user?.image || "/images/placeholder.jpg"}
          layout="fill"
        />
      </div>
      {isActive && (
        <span className="absolute block rounded-full bg-green-500 top-0 right-0 ring-2 h-2 w-2 md:h-3 md:w-3" />
      )}
    </div>
  );
};

export default Avatar;
