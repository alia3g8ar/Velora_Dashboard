import { useTranslation } from "react-i18next";

import { useForm } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { useInvalidate } from "@refinedev/core";
import type { GetFields, GetVariables } from "@refinedev/nestjs-query";

import { useQueryClient } from "@tanstack/react-query";
import { Button, Form, Space } from "antd";
import dayjs from "dayjs";

import { VeloraDatePicker } from "@/components";
import type { Task } from "@/graphql/schema.types";
import type {
  UpdateTaskMutation,
  UpdateTaskMutationVariables,
} from "@/graphql/types";
import { formatDate } from "@/utilities";

import { UPDATE_TASK_MUTATION } from "../../queries";

type Props = {
  initialValues: {
    dueDate?: Task["dueDate"];
  };
  cancelForm: () => void;
};

export const DueDateForm = ({ initialValues, cancelForm }: Props) => {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

  const { formProps, saveButtonProps } = useForm<
    GetFields<UpdateTaskMutation>,
    HttpError,
    Pick<GetVariables<UpdateTaskMutationVariables>, "dueDate">
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Form {...formProps} initialValues={initialValues}>
        <Form.Item
          noStyle
          name="dueDate"
          getValueProps={(value) => {
            if (!value) return { value: undefined };
            return { value: dayjs(value) };
          }}
        >
          <VeloraDatePicker
            format={(value) =>
              formatDate(
                value,
                i18n.language === "fa"
                  ? "YYYY/MM/DD HH:mm"
                  : "YYYY-MM-DD HH:mm",
                i18n.language,
              )
            }
            showTime={{
              showSecond: false,
              format: "HH:mm",
            }}
            style={{ backgroundColor: "#fff" }}
          />
        </Form.Item>
      </Form>
      <Space>
        <Button type="default" onClick={cancelForm}>
          {t("common.cancel")}
        </Button>
        <Button {...saveButtonProps} type="primary">
          {t("common.save")}
        </Button>
      </Space>
    </div>
  );
};
