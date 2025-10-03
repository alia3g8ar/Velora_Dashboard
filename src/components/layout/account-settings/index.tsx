import { SaveButton, useForm } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { useInvalidate } from "@refinedev/core";
import type { GetFields, GetVariables } from "@refinedev/nestjs-query";
import { useQueryClient } from "@tanstack/react-query";
import { useOne } from "@refinedev/core";

import { CloseOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Form, Input, Spin } from "antd";

import type {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from "@/graphql/types";
import { getNameInitials } from "@/utilities";

import { CustomAvatar } from "../../custom-avatar";
import { Text } from "../../text";
import { UPDATE_USER_MUTATION } from "./queries";

type Props = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userId: string;
};

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();

  // Force refetch user data
  const { refetch: refetchUser } = useOne({
    resource: "users",
    id: userId,
  });

  const {
    saveButtonProps,
    formProps,
    query: queryResult,
  } = useForm<
    GetFields<UpdateUserMutation>,
    HttpError,
    GetVariables<UpdateUserMutationVariables>
  >({
    mutationMode: "pessimistic", // Change to pessimistic for better reliability
    resource: "users",
    action: "edit",
    id: userId,
    onMutationSuccess: async () => {
      // Force refetch user data immediately
      await refetchUser();

      // Force refetch all user-related queries
      queryClient.refetchQueries({
        queryKey: ["default", "users"],
      });
      queryClient.refetchQueries({
        queryKey: ["default", "me"],
      });

      // Also use Refine's invalidate
      invalidate({
        invalidates: ["list", "detail"],
        resource: "users",
      });
      invalidate({
        invalidates: ["detail"],
        resource: "me",
      });

      // Force page refresh as last resort
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    meta: {
      gqlMutation: UPDATE_USER_MUTATION,
    },
  });
  const { avatarUrl, name } = queryResult?.data?.data || {};

  const closeModal = () => {
    setOpened(false);
  };

  if (queryResult?.isLoading) {
    return (
      <Drawer
        open={opened}
        width={756}
        styles={{
          body: {
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <Spin />
      </Drawer>
    );
  }

  return (
    <Drawer
      onClose={closeModal}
      open={opened}
      width={756}
      styles={{
        body: { background: "#f5f5f5", padding: 0 },
        header: { display: "none" },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: "#fff",
        }}
      >
        <Text strong>Account Settings</Text>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => closeModal()}
        />
      </div>
      <div
        style={{
          padding: "16px",
        }}
      >
        <Card>
          <Form {...formProps} layout="vertical">
            <CustomAvatar
              shape="square"
              src={avatarUrl}
              name={getNameInitials(name || "")}
              style={{
                width: 96,
                height: 96,
                marginBottom: "24px",
              }}
            />
            <Form.Item label="Name" name="name">
              <Input placeholder="Name" />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input placeholder="email" />
            </Form.Item>
            <Form.Item label="Job title" name="jobTitle">
              <Input placeholder="jobTitle" />
            </Form.Item>
            <Form.Item label="Phone" name="phone">
              <Input placeholder="Timezone" />
            </Form.Item>
          </Form>
          <SaveButton
            {...saveButtonProps}
            style={{
              display: "block",
              marginLeft: "auto",
            }}
          />
        </Card>
      </div>
    </Drawer>
  );
};
