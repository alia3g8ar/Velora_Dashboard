import gql from "graphql-tag";

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers {
    adminUsers {
      id
      name
      email
      avatarUrl
      role
      createdAt
    }
  }
`;

export const ADMIN_UPDATE_USER_ROLE_MUTATION = gql`
  mutation AdminUpdateUserRole($input: AdminUpdateUserRoleInput!) {
    adminUpdateUserRole(input: $input) {
      id
      role
    }
  }
`;

export const ADMIN_DELETE_USER_MUTATION = gql`
  mutation AdminDeleteUser($input: AdminDeleteUserInput!) {
    adminDeleteUser(input: $input) {
      id
    }
  }
`;
