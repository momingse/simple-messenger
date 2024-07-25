"use client";

import { User } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../Modal";
import Input from "../inputs/Input";
import Image from "next/image";
import { UploadButton } from "@/app/utils/uploadthing";
import Button from "../Buttons";
import { ClientUploadedFileData } from "uploadthing/types";

interface SettingModelProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: User | null;
}

const SettingModel: FC<SettingModelProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name,
      image: currentUser?.image,
    },
  });

  const image = watch("image");

  const handleUpload = (res: ClientUploadedFileData<any>[]) => {
    setValue("image", res[0].url, {
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    axios
      .post("/api/setting", data)
      .then(() => {
        router.refresh();
        onClose();
      })
      .catch(() => toast.error("Something went wrong"))
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="text-base font-semibold leading-7 text-gray-900 pt-4 sm:pt-0">
              Porfile
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Edit your public information
            </p>
            <div className="mt-5 flex flex-col gap-y-8">
              <Input
                disabled={isLoading}
                label="Name"
                id="name"
                errors={errors}
                required
                register={register}
              />
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900">
                  Photo
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <Image
                    width={48}
                    height={48}
                    className="rounded-full"
                    src={
                      image || currentUser?.image || "/images/placeholder.jpg"
                    }
                    alt="Avatar"
                  />
                  <UploadButton
                    endpoint="imageUploader"
                    content={{
                      button: (
                        <Button disabled={isLoading} secondary useDiv>
                          Change
                        </Button>
                      ),
                    }}
                    appearance={{
                      allowedContent: "hidden",
                    }}
                    onBeforeUploadBegin={(files) => {
                      if (files.length > 1) {
                        throw new Error("You can only upload one file");
                      }
                      return files.slice(0, 1);
                    }}
                    onClientUploadComplete={(res) => {
                      handleUpload(res);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-x-6">
            <Button disabled={isLoading} secondary onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type="submit">
              Update
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SettingModel;
