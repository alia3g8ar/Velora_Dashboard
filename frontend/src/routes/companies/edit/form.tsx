import { useTranslation } from "react-i18next";

import { Edit, useForm, useSelect } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { useInvalidate } from "@refinedev/core";
import type {
  GetFields,
  GetFieldsFromList,
  GetVariables,
} from "@refinedev/nestjs-query";

import { useQueryClient } from "@tanstack/react-query";
import { Form, Input, InputNumber, Select } from "antd";

import { AvatarFormItem, SelectOptionWithAvatar } from "@/components";
import { USERS_SELECT_QUERY } from "@/graphql/queries";
import type {
  BusinessType,
  CompanySize,
  Industry,
} from "@/graphql/schema.types";
import type {
  UpdateCompanyMutation,
  UpdateCompanyMutationVariables,
  UsersSelectQuery,
} from "@/graphql/types";

import { UPDATE_COMPANY_MUTATION } from "./queries";

export const CompanyForm = () => {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    saveButtonProps,
    formProps,
    formLoading,
    query: queryResult,
  } = useForm<
    GetFields<UpdateCompanyMutation>,
    HttpError,
    GetVariables<UpdateCompanyMutationVariables>
  >({
    redirect: false,
    mutationMode: "pessimistic", // Add pessimistic mode for better reliability
    onMutationSuccess: async () => {
      // Force refetch all company-related queries
      queryClient.refetchQueries({
        queryKey: ["default", "companies"],
      });
      // Also use Refine's invalidate
      invalidate({
        invalidates: ["list", "detail", "many"],
        resource: "companies",
      });
    },
    meta: {
      gqlMutation: UPDATE_COMPANY_MUTATION,
    },
  });
  const { selectProps: selectPropsUsers, query: queryResultUsers } = useSelect<
    GetFieldsFromList<UsersSelectQuery>
  >({
    resource: "users",
    optionLabel: "name",
    pagination: {
      mode: "off",
    },
    meta: {
      gqlQuery: USERS_SELECT_QUERY,
    },
  });

  return (
    <Edit
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      breadcrumb={false}
    >
      <Form {...formProps} layout="vertical">
        <AvatarFormItem
          size={96}
          name={queryResult?.data?.data?.name ?? ""}
        />
        <Form.Item
          label={t("companies.fields.salesOwner")}
          name="salesOwnerId"
          initialValue={formProps?.initialValues?.salesOwner?.id}
        >
          <Select
            {...selectPropsUsers}
            options={
              queryResultUsers.data?.data?.map(({ id, name, avatarUrl }) => ({
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
        <Form.Item label={t("companies.fields.companySize")} name="companySize">
          <Select
            options={companySizeOptions.map((option) => ({
              ...option,
              label: t(`enums.companySize.${option.value}`),
            }))}
          />
        </Form.Item>
        <Form.Item label={t("companies.fields.totalRevenue")} name="totalRevenue">
          <InputNumber
            autoFocus
            addonBefore={"$"}
            min={0}
            placeholder="0,00"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value: string | undefined) =>
              Number(value?.replace(/,/g, "") || 0)
            }
          />
        </Form.Item>
        <Form.Item label={t("companies.fields.industry")} name="industry">
          <Select
            options={industryOptions.map((option) => ({
              ...option,
              label: t(`enums.industry.${option.value}`),
            }))}
          />
        </Form.Item>
        <Form.Item label={t("companies.fields.businessType")} name="businessType">
          <Select
            options={businessTypeOptions.map((option) => ({
              ...option,
              label: t(`enums.businessType.${option.value}`),
            }))}
          />
        </Form.Item>
        <Form.Item label={t("companies.fields.country")} name="country">
          <Input placeholder={t("companies.fields.country")} />
        </Form.Item>
        <Form.Item label={t("companies.fields.website")} name="website">
          <Input placeholder={t("companies.fields.website")} />
        </Form.Item>
      </Form>
    </Edit>
  );
};

const companySizeOptions: {
  label: string;
  value: CompanySize;
}[] = [
  {
    label: "Enterprise",
    value: "ENTERPRISE",
  },
  {
    label: "Large",
    value: "LARGE",
  },
  {
    label: "Medium",
    value: "MEDIUM",
  },
  {
    label: "Small",
    value: "SMALL",
  },
];

const industryOptions: {
  label: string;
  value: Industry;
}[] = [
  { label: "Aerospace", value: "AEROSPACE" },
  { label: "Agriculture", value: "AGRICULTURE" },
  { label: "Automotive", value: "AUTOMOTIVE" },
  { label: "Chemicals", value: "CHEMICALS" },
  { label: "Construction", value: "CONSTRUCTION" },
  { label: "Defense", value: "DEFENSE" },
  { label: "Education", value: "EDUCATION" },
  { label: "Energy", value: "ENERGY" },
  { label: "Financial Services", value: "FINANCIAL_SERVICES" },
  { label: "Food and Beverage", value: "FOOD_AND_BEVERAGE" },
  { label: "Government", value: "GOVERNMENT" },
  { label: "Healthcare", value: "HEALTHCARE" },
  { label: "Hospitality", value: "HOSPITALITY" },
  { label: "Industrial Manufacturing", value: "INDUSTRIAL_MANUFACTURING" },
  { label: "Insurance", value: "INSURANCE" },
  { label: "Life Sciences", value: "LIFE_SCIENCES" },
  { label: "Logistics", value: "LOGISTICS" },
  { label: "Media", value: "MEDIA" },
  { label: "Mining", value: "MINING" },
  { label: "Nonprofit", value: "NONPROFIT" },
  { label: "Other", value: "OTHER" },
  { label: "Pharmaceuticals", value: "PHARMACEUTICALS" },
  { label: "Professional Services", value: "PROFESSIONAL_SERVICES" },
  { label: "Real Estate", value: "REAL_ESTATE" },
  { label: "Retail", value: "RETAIL" },
  { label: "Technology", value: "TECHNOLOGY" },
  { label: "Telecommunications", value: "TELECOMMUNICATIONS" },
  { label: "Transportation", value: "TRANSPORTATION" },
  { label: "Utilities", value: "UTILITIES" },
];

const businessTypeOptions: {
  label: string;
  value: BusinessType;
}[] = [
  {
    label: "B2B",
    value: "B2B",
  },
  {
    label: "B2C",
    value: "B2C",
  },
  {
    label: "B2G",
    value: "B2G",
  },
];
