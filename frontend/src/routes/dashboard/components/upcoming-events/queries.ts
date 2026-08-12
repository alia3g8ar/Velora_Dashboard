import gql from "graphql-tag";

export const DASHBOARD_CALENDAR_UPCOMING_EVENTS_QUERY = gql`
  query DashboardCalendarUpcomingEvents(
    $filter: EventFilter!
    $sorting: [EventSort!]
    $paging: OffsetPaging!
  ) {
    events(filter: $filter, sorting: $sorting, paging: $paging) {
      totalCount
      nodes {
        id
        title
        color
        categoryId
        startDate
        endDate
      }
    }
  }
`;

export const EVENT_CATEGORIES_QUERY = gql`
  query EventCategories {
    eventCategories(paging: { limit: 100 }) {
      nodes {
        id
        title
      }
    }
  }
`;

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($input: CreateOneEventInput!) {
    createOneEvent(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_EVENT_MUTATION = gql`
  mutation UpdateEvent($input: UpdateOneEventInput!) {
    updateOneEvent(input: $input) {
      id
      title
    }
  }
`;
