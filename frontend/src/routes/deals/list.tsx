import { useTranslation } from "react-i18next";

import {
  CreateButton,
  DeleteButton,
  EditButton,
  FilterDropdown,
  List,
  useTable,
} from "@refinedev/antd";
import { type HttpError, useGo } from "@refinedev/core";
import type { GetFieldsFromList } from "@refinedev/nestjs-query";

import { SearchOutlined } from "@ant-design/icons";
import { Input, Select, Space, Table, Tag } from "antd";

import { CustomAvatar, PaginationTotal, Text } from "@/components";
import type { DealsListQuery } from "@/graphql/types";
import { currencyNumber, formatDate } from "@/utilities";

import { DEALS_LIST_QUERY } from "./queries";

type Deal = GetFieldsFromList<DealsListQuery>;

const stageColors: Record<string, string> = {
  NEW: "blue",
  QUALIFIED: "cyan",
  PROPOSAL: "purple",
  WON: "green",
  LOST: "red",
};

export const DealListPage = () => {
  const go = useGo();
  const { t, i18n } = useTranslation();

  const { tableProps } = useTable<Deal, HttpError, Deal>({
    resource: "deals",
    onSearch: (values) => {
      return [
        {
          field: "title",
          operator: "contains",
          value: values.title,
        },
      ];
    },
    filters: {
      initial: [
        {
          field: "title",
          operator: "contains",
          value: undefined,
        },
        {
          field: "stage.id",
          operator: "eq",
          value: undefined,
        },
      ],
    },
    sorters: {
      initial: [
        {
          field: "createdAt",
          order: "desc",
        },
      ],
    },
    pagination: {
      pageSize: 12,
    },
    meta: {
      gqlQuery: DEALS_LIST_QUERY,
    },
  });

  return (
    <div className="page-container">
      <List
        breadcrumb={false}
        headerButtons={() => {
          return (
            <CreateButton
              onClick={() => {
                go({
                  to: {
                    resource: "deals",
                    action: "create",
                  },
                  options: {
                    keepQuery: true,
                  },
                  type: "replace",
                });
              }}
            />
          );
        }}
      >
        <Table
          {...tableProps}
          pagination={{
            ...tableProps.pagination,
            pageSizeOptions: ["12", "24", "48", "96"],
            showTotal: (total) => (
              <PaginationTotal total={total} entityName="deals" />
            ),
          }}
          rowKey="id"
          scroll={{ x: "max-content" }}
        >
          <Table.Column<Deal>
            dataIndex="title"
            title={t("deals.fields.title")}
            ellipsis
            width={220}
            filterIcon={<SearchOutlined />}
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Input placeholder={t("deals.fields.titlePlaceholder")} />
              </FilterDropdown>
            )}
            render={(_, record) => {
              return (
                <Text strong style={{ whiteSpace: "nowrap" }}>
                  {record.title}
                </Text>
              );
            }}
          />
          <Table.Column<Deal>
            dataIndex="company"
            title={t("deals.fields.company")}
            ellipsis
            width={200}
            render={(_, record) => {
              return (
                <Space>
                  <CustomAvatar
                    shape="square"
                    name={record.company?.name ?? ""}
                    src={record.company?.avatarUrl}
                  />
                  <Text style={{ whiteSpace: "nowrap" }}>
                    {record.company?.name}
                  </Text>
                </Space>
              );
            }}
          />
          <Table.Column<Deal>
            dataIndex="value"
            title={t("deals.fields.value")}
            width={130}
            render={(_, record) => (
              <Text strong style={{ whiteSpace: "nowrap" }}>
                {currencyNumber(record.value || 0)}
              </Text>
            )}
          />
          <Table.Column<Deal>
            dataIndex="stage"
            title={t("deals.fields.stage")}
            width={120}
            filterDropdown={(props) => (
              <FilterDropdown {...props}>
                <Select
                  style={{ width: "200px" }}
                  placeholder={t("deals.fields.stagePlaceholder")}
                  options={Object.keys(stageColors).map((title) => ({
                    value: title,
                    label: t(`enums.dealStage.${title}`, title),
                  }))}
                />
              </FilterDropdown>
            )}
            render={(_, record) => {
              const title = record.stage?.title ?? "";
              return (
                <Tag color={stageColors[title]} style={{ whiteSpace: "nowrap" }}>
                  {t(`enums.dealStage.${title}`, title)}
                </Tag>
              );
            }}
          />
          <Table.Column<Deal>
            dataIndex="dealOwner"
            title={t("deals.fields.owner")}
            ellipsis
            width={180}
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
            width={170}
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
            width={100}
            dataIndex="id"
            title={t("common.actions")}
            render={(value) => (
              <Space>
                <EditButton hideText size="small" recordItemId={value} />
                <DeleteButton hideText size="small" recordItemId={value} />
              </Space>
            )}
          />
        </Table>
      </List>
    </div>
  );
};
