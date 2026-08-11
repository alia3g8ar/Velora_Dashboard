import gql from "graphql-tag";

export const USERS_SELECT_QUERY = gql`
  query UsersSelect(
    $filter: UserFilter!
    $sorting: [UserSort!]
    $paging: OffsetPaging!
  ) {
    users(filter: $filter, sorting: $sorting, paging: $paging) {
      totalCount
      nodes {
        id
        name
        avatarUrl
      }
    }
  }
`;

export const TASK_STAGES_SELECT_QUERY = gql`
  query TaskStagesSelect(
    $filter: TaskStageFilter!
    $sorting: [TaskStageSort!]
    $paging: OffsetPaging!
  ) {
    taskStages(filter: $filter, sorting: $sorting, paging: $paging) {
      totalCount
      nodes {
        id
        title
      }
    }
  }
`;

export const COMPANIES_SELECT_QUERY = gql`
  query CompaniesSelect(
    $filter: CompanyFilter!
    $sorting: [CompanySort!]
    $paging: OffsetPaging!
  ) {
    companies(filter: $filter, sorting: $sorting, paging: $paging) {
      totalCount
      nodes {
        id
        name
        avatarUrl
      }
    }
  }
`;

export const DEAL_STAGES_SELECT_QUERY = gql`
  query DealStagesSelect(
    $filter: DealStageFilter!
    $sorting: [DealStageSort!]
    $paging: OffsetPaging!
  ) {
    dealStages(filter: $filter, sorting: $sorting, paging: $paging) {
      totalCount
      nodes {
        id
        title
      }
    }
  }
`;
