import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import {
  DeleteButton,
  EditButton,
  useModalForm,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { type HttpError, useInvalidate } from "@refinedev/core";
import type {
  GetFields,
  GetFieldsFromList,
  GetVariables,
} from "@refinedev/nestjs-query";

import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Form,
  type FormProps,
  Input,
  InputNumber,
  Modal,
  type ModalProps,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";

import { CustomAvatar, SelectOptionWithAvatar, Text, VeloraDatePicker } from "@/components";
import {
  DEAL_STAGES_SELECT_QUERY,
  USERS_SELECT_QUERY,
} from "@/graphql/queries";
import type {
  CreateDealMutation,
  CreateDealMutationVariables,
  DealsListQuery,
  DealStagesSelectQuery,
  UpdateDealMutation,
  UpdateDealMutationVariables,
  UsersSelectQuery,
} from "@/graphql/types";
import {
  CREATE_DEAL_MUTATION,
  DEAL_GET_QUERY,
  DEALS_LIST_QUERY,
  DELETE_DEAL_MUTATION,
  UPDATE_DEAL_MUTATION,
} from "@/routes/deals/queries";
import { currencyNumber, formatDate } from "@/utilities";

type Deal = GetFieldsFromList<DealsListQuery>;

const stageColors: Record<string, string> = {
  NEW: "blue",
  QUALIFIED: "cyan",
  PROPOSAL: "purple",
  WON: "green",
  LOST: "red",
};

type DealModalProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  isEdit: boolean;
  companyId: string;
};

const DealModal = ({
  modalProps,
  formProps,
  isEdit,
  companyId,
}: DealModalProps) => {
  const { t, i18n } = useTranslation();

  const { selectProps: ownerSelectProps, query: ownersQuery } = useSelect<
    GetFieldsFromList<UsersSelectQuery>
  >({
    resource: "users",
    optionLabel: "name",
    pagination: { mode: "off" },
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

  return (
    <Modal
      {...modalProps}
      title={t(
        isEdit ? "companies.deals.editDeal" : "companies.deals.addDeal",
      )}
      width={520}
    >
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          ...formProps.initialValues,
          closeDate: formProps.initialValues?.closeDate
            ? dayjs(formProps.initialValues.closeDate)
            : undefined,
        }}
      >
        <Form.Item name="companyId" hidden initialValue={companyId}>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          label={t("deals.fields.title")}
          name="title"
          rules={[
            { required: true, message: t("deals.fields.titlePlaceholder") },
          ]}
        >
          <Input placeholder={t("deals.fields.titlePlaceholder")} />
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
    </Modal>
  );
};

export const CompanyDealsTable = () => {
  const params = useParams();
  const invalidate = useInvalidate();
  const { t, i18n } = useTranslation();
  const companyId = params?.id as string;

  const invalidateDeals = () => {
    invalidate({
      resource: "deals",
      invalidates: ["list", "many"],
    });
  };

  const { tableProps } = useTable<Deal>({
    resource: "deals",
    syncWithLocation: false,
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    filters: {
      initial: [
        {
          field: "title",
          value: undefined,
          operator: "contains",
        },
      ],
      permanent: [
        {
          field: "company.id",
          operator: "eq",
          value: companyId,
        },
      ],
    },
    meta: {
      gqlQuery: DEALS_LIST_QUERY,
    },
  });

  const createForm = useModalForm<
    GetFields<CreateDealMutation>,
    HttpError,
    GetVariables<CreateDealMutationVariables>
  >({
    resource: "deals",
    action: "create",
    redirect: false,
    invalidates: ["list", "many", "detail"],
    meta: {
      gqlMutation: CREATE_DEAL_MUTATION,
    },
  });

  const editForm = useModalForm<
    GetFields<UpdateDealMutation>,
    HttpError,
    GetVariables<UpdateDealMutationVariables>
  >({
    resource: "deals",
    action: "edit",
    redirect: false,
    invalidates: ["list", "many", "detail"],
    meta: {
      gqlQuery: DEAL_GET_QUERY,
      gqlMutation: UPDATE_DEAL_MUTATION,
    },
  });

  const totalDeals =
    tableProps?.pagination !== false
      ? (tableProps.pagination as { total?: number })?.total
      : undefined;

  return (
    <Card
      headStyle={{
        borderBottom: "1px solid #D9D9D9",
        marginBottom: "1px",
      }}
      bodyStyle={{ padding: 0 }}
      title={
        <Space size="middle">
          <Text>{t("companies.deals.title")}</Text>
        </Space>
      }
      extra={
        <Space size="middle">
          <Text className="tertiary">
            {t("companies.deals.totalDeals")}
          </Text>
          <Text strong>{totalDeals}</Text>
          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => createForm.show()}
          >
            {t("companies.deals.addDeal")}
          </Button>
        </Space>
      }
    >
      <Table
        {...tableProps}
        rowKey="id"
        locale={{
          emptyText: <Empty description={t("companies.deals.noDeals")} />,
        }}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: false,
        }}
      >
        <Table.Column<Deal>
          dataIndex="title"
          title={t("deals.fields.title")}
          render={(_, record) => {
            return (
              <Text strong style={{ whiteSpace: "nowrap" }}>
                {record.title}
              </Text>
            );
          }}
        />
        <Table.Column<Deal>
          dataIndex="stage"
          title={t("deals.fields.stage")}
          render={(_, record) => {
            const title = record.stage?.title ?? "";
            return (
              <Tag
                color={stageColors[title]}
                style={{ whiteSpace: "nowrap" }}
              >
                {t(`enums.dealStage.${title}`, title)}
              </Tag>
            );
          }}
        />
        <Table.Column<Deal>
          dataIndex="value"
          title={t("deals.fields.value")}
          render={(_, record) => (
            <Text strong>{currencyNumber(record.value || 0)}</Text>
          )}
        />
        <Table.Column<Deal>
          dataIndex="dealOwner"
          title={t("deals.fields.owner")}
          render={(_, record) => {
            return (
              <Space>
                <CustomAvatar
                  name={record.dealOwner?.name ?? ""}
                  src={record.dealOwner?.avatarUrl}
                />
                <Text style={{ whiteSpace: "nowrap" }}>
                  {record.dealOwner?.name}
                </Text>
              </Space>
            );
          }}
        />
        <Table.Column<Deal>
          dataIndex="closeDate"
          title={t("deals.fields.closeDate")}
          render={(_, record) => {
            if (!record.closeDate) return <Text type="secondary">—</Text>;
            return (
              <Text style={{ whiteSpace: "nowrap" }}>
                {formatDate(record.closeDate, "MMM D, YYYY", i18n.language)}
              </Text>
            );
          }}
        />
        <Table.Column<Deal>
          dataIndex="id"
          width={120}
          render={(value) => {
            return (
              <Space>
                <EditButton
                  hideText
                  size="small"
                  recordItemId={value}
                  onClick={() => editForm.show(value)}
                />
                <DeleteButton
                  hideText
                  size="small"
                  recordItemId={value}
                  resource="deals"
                  meta={{
                    gqlMutation: DELETE_DEAL_MUTATION,
                  }}
                  onSuccess={invalidateDeals}
                />
              </Space>
            );
          }}
        />
      </Table>

      <DealModal
        modalProps={createForm.modalProps}
        formProps={createForm.formProps}
        isEdit={false}
        companyId={companyId}
      />
      <DealModal
        modalProps={editForm.modalProps}
        formProps={editForm.formProps}
        isEdit
        companyId={companyId}
      />
    </Card>
  );
};
