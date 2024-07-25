"use client";

import useConversation from "@/app/hooks/useConversation";
import axios from "axios";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import MessageInput from "./MessageInput";
import { UploadButton } from "@/app/utils/uploadthing";
import { useSocket } from "@/app/context/SocketProvider";
import LoadingModal from "@/app/components/LoadingModal";
import toast from "react-hot-toast";

const Form = () => {
  const { conversationId } = useConversation();
  const { isConnected, socket } = useSocket();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data: FieldValues) => {
    if (!socket || !isConnected) {
      toast.error("Socket not connected");
      return;
    }
    setValue("message", "", { shouldValidate: true });
    socket.emit("message", {
      ...data,
      conversationId,
    });
  };

  return (
    <>
      <div className="py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full">
        <UploadButton
          endpoint="imageUploader"
          content={{
            button: <HiPhoto size={30} className="text-sky-500" />,
          }}
          appearance={{
            allowedContent: "hidden",
          }}
          onClientUploadComplete={(res) => {
            res.forEach((file) => {
              axios.post("/api/messages", {
                image: file.url,
                conversationId,
              });
            });
          }}
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-2 lg:gap-4 w-full"
        >
          <MessageInput
            id="message"
            register={register}
            errors={errors}
            required
            placeholder="Type a message"
          />
          <button
            type="submit"
            className="rounded-full p-2 bg-sky-500 cursor-pointer hover:bg-sky-600 transition"
          >
            <HiPaperAirplane size={18} className="text-white" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Form;
