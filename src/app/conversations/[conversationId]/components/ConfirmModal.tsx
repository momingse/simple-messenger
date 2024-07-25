"use client";

import Button from "@/app/components/Buttons";
import Modal from "@/app/components/Modal";
import { useSocket } from "@/app/context/SocketProvider";
import useConversation from "@/app/hooks/useConversation";
import useSocketTwoWayConversation from "@/app/hooks/useSocketTwoWayConversation";
import { DialogTitle } from "@headlessui/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useCallback, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmModelProps {
  isOpen?: boolean;
  onClose: () => void;
}

const ConfirmModel: FC<ConfirmModelProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { conversationId } = useConversation();
  const [isLoading, setIsLoading] = useState(false);
  const { socket } = useSocket();
  const { emitter } = useSocketTwoWayConversation<
    { conversationId: string },
    any
  >(socket, "conversationDelete", "conversation:remove");

  const onDelete = useCallback(async () => {
    if (!socket) {
      toast.error("Socket not connected");
      return;
    }

    setIsLoading(true);
    emitter({ conversationId })
      .then(() => {
        onClose();
        router.push("/conversations");
        router.refresh();
      })
      .catch(() => {
        toast.error("Failed to delete conversation");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [socket, conversationId, onClose, router, emitter]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="sm:flex sm:items-start pt-2">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <FiAlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <DialogTitle
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Delete Conversation
          </DialogTitle>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this conversation?
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 flex flex-row-reverse items-center sm:justify-start justify-center">
        <Button disabled={isLoading} danger onClick={onDelete}>
          Delete
        </Button>
        <Button disabled={isLoading} secondary onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModel;
