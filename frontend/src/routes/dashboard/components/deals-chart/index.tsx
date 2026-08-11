import React from "react";
import { useTranslation } from "react-i18next";

import { useList } from "@refinedev/core";
import type { GetFieldsFromList } from "@refinedev/nestjs-query";

import { DollarOutlined } from "@ant-design/icons";
import { Area, type AreaConfig } from "@ant-design/plots";
import { Card } from "antd";

import { Text } from "@/components";
import type { DashboardDealsChartQuery } from "@/graphql/types";

import { DASHBOARD_DEALS_CHART_QUERY } from "./queries";
import { mapDealsData } from "./utils";

export const DashboardDealsChart = () => {
  const { t } = useTranslation();
  const { data } = useList<GetFieldsFromList<DashboardDealsChartQuery>>({
    resource: "dealStages",
    filters: [{ field: "title", operator: "in", value: ["WON", "LOST"] }],
    meta: {
      gqlQuery: DASHBOARD_DEALS_CHART_QUERY,
    },
  });

  const dealData = React.useMemo(() => {
    return mapDealsData(data?.data);
  }, [data?.data]);

  const config: AreaConfig = {
    isStack: false,
    data: dealData,
    xField: "timeText",
    yField: "value",
    seriesField: "state",
    animation: true,
    startOnZero: false,
    smooth: true,
    legend: {
      offsetY: -6,
      itemName: {
        formatter: (name: string) => {
          return t(`dashboard.dealState.${name.toLowerCase()}`, name);
        },
      },
    },
    yAxis: {
      tickCount: 4,
      label: {
        formatter: (v) => {
          return `$${Number(v) / 1000}k`;
        },
      },
    },
    tooltip: {
      formatter: (data) => {
        return {
          name: String(
            t(`dashboard.dealState.${data.state.toLowerCase()}`, data.state),
          ),
          value: `$${Number(data.value) / 1000}k`,
        };
      },
    },
    areaStyle: (datum) => {
      const won = "l(270) 0:#ffffff 0.5:#b7eb8f 1:#52c41a";
      const lost = "l(270) 0:#ffffff 0.5:#f3b7c2 1:#ff4d4f";
      return { fill: datum.state === "Won" ? won : lost };
    },
    color: (datum) => {
      return datum.state === "Won" ? "#52C41A" : "#F5222D";
    },
  };

  return (
    <Card
      style={{ height: "100%" }}
      headStyle={{ padding: "8px 16px" }}
      bodyStyle={{ padding: "24px 24px 0px 24px" }}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <DollarOutlined />
          <Text size="sm" style={{ marginInlineStart: ".5rem" }}>
            {t("dashboard.deals")}
          </Text>
        </div>
      }
    >
      <Area {...config} height={325} />
    </Card>
  );
};
