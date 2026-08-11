import type { GetFieldsFromList } from "@refinedev/nestjs-query";

import dayjs from "dayjs";

import type { DashboardDealsChartQuery } from "@/graphql/types";
import { formatDate } from "@/utilities";

type DealStage = GetFieldsFromList<DashboardDealsChartQuery>;

type DealAggregate = DealStage["dealsAggregate"][0];

interface MappedDealData {
  timeUnix: number;
  timeText: string;
  value: number;
  state: string;
}

const filterDeal = (deal?: DealAggregate) =>
  deal?.groupBy?.closeDateMonth && deal.groupBy.closeDateYear;

const mapDeals = (
  deals: DealAggregate[] = [],
  state: string,
  locale?: string,
): MappedDealData[] => {
  return deals.filter(filterDeal).map((deal) => {
    const { closeDateMonth, closeDateYear } = deal.groupBy as NonNullable<
      DealAggregate["groupBy"]
    >;

    const date = dayjs(`${closeDateYear}-${closeDateMonth}-01`);

    return {
      timeUnix: date.unix(),
      timeText: formatDate(date, "MMM YYYY", locale),
      value: deal.sum?.value ?? 0,
      state,
    };
  });
};

export const mapDealsData = (
  dealStages: DealStage[] = [],
  locale?: string,
): MappedDealData[] => {
  const won = dealStages.find((stage) => stage.title === "WON");

  const wonDeals = mapDeals(won?.dealsAggregate, "Won", locale);

  const lost = dealStages.find((stage) => stage.title === "LOST");

  const lostDeals = mapDeals(lost?.dealsAggregate, "Lost", locale);

  return [...wonDeals, ...lostDeals].sort((a, b) => a.timeUnix - b.timeUnix);
};
