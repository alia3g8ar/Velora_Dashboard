import gql from "graphql-tag";

export const DEALS_LIST_QUERY = gql`
  query DealsList(
    $filter: DealFilter!
    $sorting: [DealSort!]
    $paging: OffsetPaging!
  ) {
    deals(filter: $filter, sorting: $sorting, paging: $paging) {
      totalCount
      nodes {
        id
        title
        value
        closeDate
        company {
          id
          name
          avatarUrl
        }
        dealOwner {
          id
          name
          avatarUrl
        }
        stage {
          id
          title
        }
      }
    }
  }
`;

export const CREATE_DEAL_MUTATION = gql`
  mutation CreateDeal($input: CreateOneDealInput!) {
    createOneDeal(input: $input) {
      id
      title
      value
    }
  }
`;

export const UPDATE_DEAL_MUTATION = gql`
  mutation UpdateDeal($input: UpdateOneDealInput!) {
    updateOneDeal(input: $input) {
      id
      title
      value
    }
  }
`;

export const DELETE_DEAL_MUTATION = gql`
  mutation DeleteDeal($input: DeleteOneDealInput!) {
    deleteOneDeal(input: $input) {
      id
    }
  }
`;
