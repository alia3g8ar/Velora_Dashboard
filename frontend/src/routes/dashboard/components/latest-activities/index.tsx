import { useTranslation } from "react-i18next";

import { useList } from "@refinedev/core";
import type { GetFieldsFromList } from "@refinedev/nestjs-query";

import { UnorderedListOutlined } from "@ant-design/icons";
import { Card, List, Skeleton as AntdSkeleton, Space } from "antd";

import { CustomAvatar, Text } from "@/components";
import type {
  DashboardLatestActivitiesAuditsQuery,
  DashboardLatestActivitiesDealsQuery,
} from "@/graphql/types";
import { formatDate } from "@/utilities";

import {
  DASHBOARD_LATEST_ACTIVITIES_AUDITS_QUERY,
  DASHBOARD_LATEST_ACTIVITIES_DEALS_QUERY,
} from "./queries";

type Props = { limit?: number };

export const DashboardLatestActivities = ({ limit = 5 }: Props) => {
  const { t, i18n } = useTranslation();
  const {
    data: audit,
    isLoading: isLoadingAudit,
    isError,
    error,
  } = useList<GetFieldsFromList<DashboardLatestActivitiesAuditsQuery>>({
    resource: "audits",
    pagination: {
      pageSize: limit,
    },
    sorters: [
      {
        field: "createdAt",
        order: "desc",
      },
    ],
    filters: [
      {
        field: "action",
        operator: "in",
        value: ["CREATE", "UPDATE"],
      },
      {
        field: "targetEntity",
        operator: "eq",
        value: "Deal",
      },
    ],
    meta: {
      gqlQuery: DASHBOARD_LATEST_ACTIVITIES_AUDITS_QUERY,
    },
  });

  const dealIds = audit?.data?.map((audit) => audit.targetId);

  const { data: deals, isLoading: isLoadingDeals } = useList<
    GetFieldsFromList<DashboardLatestActivitiesDealsQuery>
  >({
    resource: "deals",
    queryOptions: { enabled: !!dealIds?.length },
    pagination: {
      mode: "off",
    },
    filters: [{ field: "id", operator: "in", value: dealIds }],
    meta: {
      gqlQuery: DASHBOARD_LATEST_ACTIVITIES_DEALS_QUERY,
    },
  });

  if (isError) {
    console.error("Error fetching latest activities", error);
    return null;
  }

  const isLoading = isLoadingAudit || isLoadingDeals;

  const getTitleFormat = () => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      return width < 768 ? "MMM DD, HH:mm" : "MMM DD, YYYY - HH:mm";
    }
    return "MMM DD, YYYY - HH:mm";
  };

  return (
    <Card
      headStyle={{ padding: "16px" }}
      bodyStyle={{
        padding: "0 1rem",
      }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <UnorderedListOutlined />
          <Text size="sm" style={{ marginInlineStart: ".5rem" }}>
            {t("dashboard.latestActivities")}
          </Text>
        </div>
      }
    >
      {isLoading ? (
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: limit }).map((_, index) => ({
            id: index,
          }))}
          renderItem={(_item, index) => {
            return (
              <List.Item key={index}>
                <List.Item.Meta
                  avatar={
                    <AntdSkeleton.Avatar
                      active
                      size={48}
                      shape="square"
                      style={{
                        borderRadius: "4px",
                      }}
                    />
                  }
                  title={
                    <AntdSkeleton.Button
                      active
                      style={{
                        height: "16px",
                      }}
                    />
                  }
                  description={
                    <AntdSkeleton.Button
                      active
                      style={{
                        width: "100%",
                        height: "16px",
                      }}
                    />
                  }
                />
              </List.Item>
            );
          }}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={audit?.data || []}
          renderItem={(item) => {
            const deal =
              deals?.data.find((deal) => deal.id === `${item.targetId}`) ||
              undefined;

            const titleFormat = getTitleFormat();
            const titleText = deal
              ? formatDate(deal.createdAt, titleFormat, i18n.language)
              : "";

            return (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <CustomAvatar
                      shape="square"
                      size={48}
                      src={deal?.company.avatarUrl}
                      name={deal?.company.name}
                    />
                  }
                  title={
                    <div
                      style={{
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {titleText}
                    </div>
                  }
                  description={
                    <Space
                      size={4}
                      style={{
                        flexWrap: "wrap",
                        width: "100%",
                        gap: "4px",
                      }}
                      direction="horizontal"
                    >
                      <Text
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {item.action === "CREATE"
                          ? t("dashboard.activities.createdSentence", {
                              user: item.user?.name,
                              deal: deal?.title,
                              stage: deal?.stage?.title
                                ? t(`enums.dealStage.${deal.stage.title}`)
                                : t("common.unassigned"),
                            })
                          : t("dashboard.activities.movedSentence", {
                              user: item.user?.name,
                              deal: deal?.title,
                              stage: deal?.stage?.title
                                ? t(`enums.dealStage.${deal.stage.title}`)
                                : t("common.unassigned"),
                            })}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};
