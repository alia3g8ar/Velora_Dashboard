import { useTranslation } from "react-i18next";

import { useModalForm, useSelect } from "@refinedev/antd";
import { type HttpError, useGetIdentity, useGo } from "@refinedev/core";
import type {
  GetFields,
  GetFieldsFromList,
  GetVariables,
} from "@refinedev/nestjs-query";

import { Form, Input, Modal, Select } from "antd";

import { AvatarFormItem, SelectOptionWithAvatar } from "@/components";
import { USERS_SELECT_QUERY } from "@/graphql/queries";
import type { User } from "@/graphql/schema.types";
import type {
  CreateCompanyMutation,
  CreateCompanyMutationVariables,
  UsersSelectQuery,
} from "@/graphql/types";

import { CREATE_COMPANY_MUTATION } from "./queries";

export const CompanyCreateModal = () => {
  const go = useGo();
  const { t } = useTranslation();
  // With per-user data isolation the sales owner is always the current user,
  // so pre-select it and skip the redundant dropdown step.
  const { data: currentUser } = useGetIdentity<User>();

  const goToListPage = () => {
    go({
      to: { resource: "companies", action: "list" },
      options: {
        keepQuery: true,
      },
      type: "replace",
    });
  };

  const { formProps, modalProps } = useModalForm<
    GetFields<CreateCompanyMutation>,
    HttpError,
    GetVariables<CreateCompanyMutationVariables>
  >({
    action: "create",
    defaultVisible: true,
    resource: "companies",
    redirect: false,
    mutationMode: "pessimistic",
    defaultFormValues: currentUser?.id
      ? { salesOwnerId: currentUser.id }
      : undefined,
    onMutationSuccess: goToListPage,
    meta: {
      gqlMutation: CREATE_COMPANY_MUTATION,
    },
  });

  const { selectProps, query: queryResult } = useSelect<
    GetFieldsFromList<UsersSelectQuery>
  >({
    resource: "users",
    meta: {
      gqlQuery: USERS_SELECT_QUERY,
    },
    optionLabel: "name",
    // The backend scopes the users list to the current user, so this picker
    // only ever offers the acting user as an option.
  });

  return (
    <Modal
      {...modalProps}
      mask={true}
      onCancel={goToListPage}
      title={t("companies.fields.addNewCompany")}
      width={512}
    >
      <Form {...formProps} layout="vertical">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <AvatarFormItem size={88} />
        </div>
        <Form.Item
          label={t("companies.fields.companyName")}
          name="name"
          rules={[{ required: true }]}
        >
          <Input placeholder={t("companies.fields.enterCompanyName")} />
        </Form.Item>
        <Form.Item
          label={t("companies.fields.salesOwner")}
          name="salesOwnerId"
          rules={[{ required: true }]}
        >
          <Select
            placeholder={t("companies.fields.enterSalesOwner")}
            {...selectProps}
            options={
              queryResult.data?.data?.map((user) => ({
                value: user.id,
                label: (
                  <SelectOptionWithAvatar
                    name={user.name ?? ""}
                    avatarUrl={user.avatarUrl ?? undefined}
                  />
                ),
              })) ?? []
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
