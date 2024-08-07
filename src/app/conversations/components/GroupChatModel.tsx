"use client";

import Button from "@/app/components/Buttons";
import Modal from "@/app/components/Modal";
import Input from "@/app/components/inputs/Input";
import Select from "@/app/components/inputs/Select";
import { useSocket } from "@/app/context/SocketProvider";
import useSocketTwoWayConversation from "@/app/hooks/useSocketTwoWayConversation";
import { FullConversationType } from "@/types";
import axios from "axios";
import { User } from "next-auth";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface GroupChatModalProps {
  users: User[];
  isOpen: boolean;
  onClose: () => void;
}

const GroupChatModal: FC<GroupChatModalProps> = ({
  users,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const { emitter } = useSocketTwoWayConversation<
    {
      isGroup: true;
      [key: string]: any;
    },
    FullConversationType
  >(socket, "conversationCreate", "conversation:new");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      members: [],
    },
  });

  const members = watch("members");

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(false);
    if (!socket) {
      toast.error("Socket not connected");
      setIsLoading(false);
      return;
    }

    emitter({ ...data, isGroup: true })
      ?.then((data) => {
        router.push(`/conversations/${data.id}`);
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900 pt-4 sm:pt-0">
              Create a group chat
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Create a chat with more then 2 members
            </p>
            <div className="mt-10 flex flex-col gap-y-8">
              <Input
                register={register}
                label="Name"
                id="name"
                disabled={isLoading}
                required
                errors={errors}
              />
              <Select
                disabled={isLoading}
                label="Members"
                options={users.map((user) => ({
                  value: user.id,
                  label: user.name,
                }))}
                onChange={(value) => setValue("members", value)}
                value={members}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-6">
          <Button
            disabled={isLoading}
            type="button"
            secondary
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GroupChatModal;
