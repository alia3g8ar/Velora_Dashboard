import gql from "graphql-tag";

export const COMPANY_CONTACTS_TABLE_QUERY = gql`
  query CompanyContactsTable(
    $filter: ContactFilter!
    $sorting: [ContactSort!]
    $paging: OffsetPaging!
  ) {
    contacts(filter: $filter, sorting: $sorting, paging: $paging) {
      totalCount
      nodes {
        id
        name
        avatarUrl
        jobTitle
        email
        phone
        status
      }
    }
  }
`;

export const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany($input: UpdateOneCompanyInput!) {
    updateOneCompany(input: $input) {
      id
      name
      totalRevenue
      industry
      companySize
      businessType
      country
      website
      avatarUrl
      salesOwner {
        id
        name
        avatarUrl
      }
    }
  }
`;

export const CREATE_CONTACT_MUTATION = gql`
  mutation CreateContact($input: CreateOneContactInput!) {
    createOneContact(input: $input) {
      id
      name
      email
      jobTitle
      phone
      status
      stage
      score
    }
  }
`;

export const UPDATE_CONTACT_MUTATION = gql`
  mutation UpdateContact($input: UpdateOneContactInput!) {
    updateOneContact(input: $input) {
      id
      name
      email
      jobTitle
      phone
      status
      stage
      score
    }
  }
`;

export const DELETE_CONTACT_MUTATION = gql`
  mutation DeleteContact($input: DeleteOneContactInput!) {
    deleteOneContact(input: $input) {
      id
    }
  }
`;
