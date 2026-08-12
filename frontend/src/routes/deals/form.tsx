import { useTranslation } from "react-i18next";

import { Create, Edit, useForm, useSelect } from "@refinedev/antd";
import { type HttpError, useGetIdentity, useGo } from "@refinedev/core";
import type { GetFields, GetFieldsFromList } from "@refinedev/nestjs-query";

import { Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";

import { SelectOptionWithAvatar, VeloraDatePicker } from "@/components";
import {
  COMPANIES_SELECT_QUERY,
  DEAL_STAGES_SELECT_QUERY,
  USERS_SELECT_QUERY,
} from "@/graphql/queries";
import type { User } from "@/graphql/schema.types";
import type {
  CompaniesSelectQuery,
  CreateDealMutation,
  DealStagesSelectQuery,
  UsersSelectQuery,
} from "@/graphql/types";
import { formatDate } from "@/utilities";

import { CREATE_DEAL_MUTATION, UPDATE_DEAL_MUTATION } from "./queries";

type DealFormProps = {
  action: "create" | "edit";
};

export const DealForm = ({ action }: DealFormProps) => {
  const { t, i18n } = useTranslation();
  const go = useGo();
  const isEdit = action === "edit";
  // With per-user data isolation the deal owner is always the current user.
  const { data: currentUser } = useGetIdentity<User>();

  const { saveButtonProps, formProps, formLoading } = useForm<
    GetFields<CreateDealMutation>,
    HttpError
  >({
    action,
    redirect: false,
    mutationMode: "pessimistic",
    onMutationSuccess: () => {
      go({
        to: { resource: "deals", action: "list" },
        options: { keepQuery: true },
        type: "replace",
      });
    },
    meta: {
      gqlMutation: isEdit ? UPDATE_DEAL_MUTATION : CREATE_DEAL_MUTATION,
    },
  });

  const { selectProps: companySelectProps, query: companiesQuery } = useSelect<
    GetFieldsFromList<CompaniesSelectQuery>
  >({
    resource: "companies",
    optionLabel: "name",
    pagination: { mode: "off" },
    meta: {
      gqlQuery: COMPANIES_SELECT_QUERY,
    },
  });

  const { selectProps: ownerSelectProps, query: ownersQuery } = useSelect<
    GetFieldsFromList<UsersSelectQuery>
  >({
    resource: "users",
    optionLabel: "name",
    pagination: { mode: "off" },
    // The backend scopes the users list to the current user, so this picker
    // only ever offers the acting user as an option.
    meta: {
      gqlQuery: USERS_SELECT_QUERY,
    },
  });

  const { selectProps: stageSelectProps, query: stagesQuery } = useSelect<
    GetFieldsFromList<DealStagesSelectQuery>
  >({
    resource: "dealStages",
    optionLabel: "title",
    pagination: { mode: "off" },
    meta: {
      gqlQuery: DEAL_STAGES_SELECT_QUERY,
    },
  });

  const Wrapper = isEdit ? Edit : Create;

  return (
    <Wrapper
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      breadcrumb={false}
    >
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          ...formProps.initialValues,
          // Only the create form needs the owner; edits already carry it.
          dealOwnerId:
            !isEdit && !formProps.initialValues?.dealOwnerId
              ? currentUser?.id
              : formProps.initialValues?.dealOwnerId,
          closeDate: formProps.initialValues?.closeDate
            ? dayjs(formProps.initialValues.closeDate)
            : undefined,
        }}
      >
        <Form.Item
          label={t("deals.fields.title")}
          name="title"
          rules={[{ required: true }]}
        >
          <Input placeholder={t("deals.fields.titlePlaceholder")} />
        </Form.Item>

        <Form.Item
          label={t("deals.fields.company")}
          name="companyId"
          rules={[{ required: true }]}
        >
          <Select
            {...companySelectProps}
            placeholder={t("deals.fields.companyPlaceholder")}
            options={
              companiesQuery.data?.data?.map(({ id, name, avatarUrl }) => ({
                value: id,
                label: (
                  <SelectOptionWithAvatar
                    name={name ?? ""}
                    avatarUrl={avatarUrl ?? undefined}
                  />
                ),
              })) ?? []
            }
          />
        </Form.Item>

        <Form.Item
          label={t("deals.fields.owner")}
          name="dealOwnerId"
          rules={[{ required: true }]}
        >
          <Select
            {...ownerSelectProps}
            placeholder={t("deals.fields.ownerPlaceholder")}
            options={
              ownersQuery.data?.data?.map(({ id, name, avatarUrl }) => ({
                value: id,
                label: (
                  <SelectOptionWithAvatar
                    name={name ?? ""}
                    avatarUrl={avatarUrl ?? undefined}
                  />
                ),
              })) ?? []
            }
          />
        </Form.Item>

        <Form.Item label={t("deals.fields.stage")} name="stageId">
          <Select
            {...stageSelectProps}
            placeholder={t("deals.fields.stagePlaceholder")}
            options={
              stagesQuery.data?.data?.map(({ id, title }) => ({
                value: id,
                label: t(`enums.dealStage.${title}`, title),
              })) ?? []
            }
          />
        </Form.Item>

        <Form.Item label={t("deals.fields.value")} name="value">
          <InputNumber
            addonBefore="$"
            min={0}
            placeholder="0,00"
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value: string | undefined) =>
              Number(value?.replace(/,/g, "") || 0)
            }
          />
        </Form.Item>

        <Form.Item label={t("deals.fields.closeDate")} name="closeDate">
          <VeloraDatePicker
            style={{ width: "100%" }}
            format={(value) =>
              formatDate(
                value,
                i18n.language === "fa" ? "YYYY/MM/DD" : "YYYY-MM-DD",
                i18n.language,
              )
            }
          />
        </Form.Item>

        <Form.Item label={t("deals.fields.notes")} name="notes">
          <Input.TextArea
            rows={3}
            placeholder={t("deals.fields.notesPlaceholder")}
          />
        </Form.Item>
      </Form>
    </Wrapper>
  );
};
