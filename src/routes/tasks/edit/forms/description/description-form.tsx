import { useForm } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { useInvalidate } from "@refinedev/core";
import type { GetFields, GetVariables } from "@refinedev/nestjs-query";
import { useQueryClient } from "@tanstack/react-query";

import MDEditor from "@uiw/react-md-editor";
import { Button, Form, Space } from "antd";

import type { Task } from "@/graphql/schema.types";
import type {
  UpdateTaskMutation,
  UpdateTaskMutationVariables,
} from "@/graphql/types";

import { UPDATE_TASK_MUTATION } from "../../queries";

type Props = {
  initialValues: {
    description?: Task["description"];
  };
  cancelForm: () => void;
};

export const DescriptionForm = ({ initialValues, cancelForm }: Props) => {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();

  const { formProps, saveButtonProps } = useForm<
    GetFields<UpdateTaskMutation>,
    HttpError,
    Pick<GetVariables<UpdateTaskMutationVariables>, "description">
  >({
    queryOptions: {
      enabled: false,
    },
    redirect: false,
    onMutationSuccess: () => {
      // Force refetch all task-related queries
      queryClient.refetchQueries({
        queryKey: ["default", "tasks"],
      });
      // Also use Refine's invalidate
      invalidate({
        invalidates: ["list", "detail"],
        resource: "tasks",
      });
      cancelForm();
    },
    meta: {
      gqlMutation: UPDATE_TASK_MUTATION,
    },
  });

  return (
    <>
      <Form {...formProps} initialValues={initialValues}>
        <Form.Item noStyle name="description">
          <MDEditor preview="edit" data-color-mode="light" height={250} />
        </Form.Item>
      </Form>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
          marginTop: "12px",
        }}
      >
        <Space>
          <Button type="default" onClick={cancelForm}>
            Cancel
          </Button>
          <Button {...saveButtonProps} type="primary">
            Save
          </Button>
        </Space>
      </div>
    </>
  );
};
