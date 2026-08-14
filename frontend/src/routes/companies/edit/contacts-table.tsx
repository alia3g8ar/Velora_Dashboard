import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

import {
  DeleteButton,
  EditButton,
  FilterDropdown,
  useModalForm,
  useSelect,
  useTable,
} from "@refinedev/antd";
import {
  type HttpError,
  useGetIdentity,
  useInvalidate,
} from "@refinedev/core";
import type {
  GetFields,
  GetFieldsFromList,
  GetVariables,
} from "@refinedev/nestjs-query";

import {
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
} from "@ant-design/icons";
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
} from "antd";

import {
  AvatarFormItem,
  ContactStatusTag,
  CustomAvatar,
  SelectOptionWithAvatar,
  Text,
} from "@/components";
import { USERS_SELECT_QUERY } from "@/graphql/queries";
import type { ContactStage, User } from "@/graphql/schema.types";
import type {
  CompanyContactsTableQuery,
  CreateContactMutation,
  CreateContactMutationVariables,
  UpdateContactMutation,
  UpdateContactMutationVariables,
  UsersSelectQuery,
} from "@/graphql/types";

import {
  COMPANY_CONTACTS_TABLE_QUERY,
  CREATE_CONTACT_MUTATION,
  DELETE_CONTACT_MUTATION,
  UPDATE_CONTACT_MUTATION,
} from "./queries";

type Contact = GetFieldsFromList<CompanyContactsTableQuery>;

type ContactModalProps = {
  modalProps: ModalProps;
  formProps: FormProps;
  isEdit: boolean;
  companyId: string;
};

const ContactModal = ({
  modalProps,
  formProps,
  isEdit,
  companyId,
}: ContactModalProps) => {
  const { t } = useTranslation();

  const { selectProps, query } = useSelect<GetFieldsFromList<UsersSelectQuery>>({
    resource: "users",
    optionLabel: "name",
    pagination: { mode: "off" },
    // The backend scopes the users list to the current user, so this picker
    // only ever offers the acting user as an option.
    meta: {
      gqlQuery: USERS_SELECT_QUERY,
    },
  });

  return (
    <Modal
      {...modalProps}
      title={t(
        isEdit
          ? "companies.contacts.editContact"
          : "companies.contacts.addContact",
      )}
      width={520}
    >
      <Form
        {...formProps}
        layout="vertical"
        initialValues={
          formProps.initialValues ?? {
            status: "NEW",
            stage: "LEAD" as ContactStage,
          }
        }
      >
        <Form.Item name="companyId" hidden initialValue={companyId}>
          <Input type="hidden" />
        </Form.Item>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <AvatarFormItem size={88} />
        </div>
        <Form.Item
          label={t("companies.contacts.name")}
          name="name"
          rules={[
            { required: true, message: t("companies.contacts.enterName") },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t("companies.contacts.email")}
          name="email"
          rules={[
            { required: true, message: t("companies.contacts.enterEmail") },
            { type: "email", message: t("companies.contacts.enterEmail") },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t("companies.contacts.jobTitle")} name="jobTitle">
          <Input />
        </Form.Item>
        <Form.Item label={t("companies.contacts.phone")} name="phone">
          <Input />
        </Form.Item>
        <Form.Item label={t("companies.contacts.status")} name="status">
          <Select
            options={statusOptions.map((option) => ({
              ...option,
              label: t(`enums.contactStatus.${option.value}`),
            }))}
          />
        </Form.Item>
        <Form.Item label={t("companies.contacts.stage")} name="stage">
          <Select
            options={stageOptions.map((option) => ({
              ...option,
              label: t(`enums.contactStage.${option.value}`, option.label),
            }))}
          />
        </Form.Item>
        <Form.Item label={t("companies.contacts.score")} name="score">
          <InputNumber min={0} max={100} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label={t("companies.fields.salesOwner")}
          name="salesOwnerId"
          rules={[{ required: true }]}
        >
          <Select
            {...selectProps}
            options={
              query.data?.data?.map(({ id, name, avatarUrl }) => ({
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
      </Form>
    </Modal>
  );
};

export const CompanyContactsTable = () => {
  const params = useParams();
  const invalidate = useInvalidate();
  const { t } = useTranslation();
  const companyId = params?.id as string;
  // With per-user data isolation the sales owner is always the current user.
  const { data: currentUser } = useGetIdentity<User>();

  const invalidateContacts = () => {
    invalidate({
      resource: "contacts",
      invalidates: ["list", "many"],
    });
  };

  const { tableProps } = useTable<Contact>({
    resource: "contacts",
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
      // Note: keep initial values `undefined` (not empty strings) so the data
      // provider drops them. An empty `contains` filter becomes `iLike: "%%"`,
      // which in MySQL excludes rows with NULL in that column.
      initial: [
        {
          field: "jobTitle",
          value: undefined,
          operator: "contains",
        },
        {
          field: "name",
          value: undefined,
          operator: "contains",
        },
        {
          field: "status",
          value: undefined,
          operator: "in",
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
      gqlQuery: COMPANY_CONTACTS_TABLE_QUERY,
    },
  });

  const createForm = useModalForm<
    GetFields<CreateContactMutation>,
    HttpError,
    GetVariables<CreateContactMutationVariables>
  >({
    resource: "contacts",
    action: "create",
    redirect: false,
    invalidates: ["list", "many", "detail"],
    defaultFormValues: {
      status: "NEW",
      stage: "LEAD" as ContactStage,
      ...(currentUser?.id ? { salesOwnerId: currentUser.id } : {}),
    },
    meta: {
      gqlMutation: CREATE_CONTACT_MUTATION,
    },
  });

  const editForm = useModalForm<
    GetFields<UpdateContactMutation>,
    HttpError,
    GetVariables<UpdateContactMutationVariables>
  >({
    resource: "contacts",
    action: "edit",
    redirect: false,
    invalidates: ["list", "many", "detail"],
    meta: {
      gqlMutation: UPDATE_CONTACT_MUTATION,
    },
  });

  const totalContacts =
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
          <TeamOutlined />
          <Text>{t("companies.contacts.title")}</Text>
        </Space>
      }
      extra={
        <Space size="middle">
          <Text className="tertiary">
            {t("companies.contacts.totalContacts")}
          </Text>
          <Text strong>{totalContacts}</Text>
          <Button
            size="small"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => createForm.show()}
          >
            {t("companies.contacts.addContact")}
          </Button>
        </Space>
      }
    >
      <Table
        {...tableProps}
        rowKey="id"
        locale={{
          emptyText: <Empty description={t("companies.contacts.noContacts")} />,
        }}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: false,
        }}
        scroll={{ x: "max-content" }}
      >
        <Table.Column<Contact>
          title={t("companies.contacts.name")}
          dataIndex="name"
          ellipsis
          width={200}
          render={(_, record) => {
            return (
              <Space>
                <CustomAvatar name={record.name} src={record.avatarUrl} />
                <Text
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {record.name}
                </Text>
              </Space>
            );
          }}
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder={t("companies.contacts.searchName")} />
            </FilterDropdown>
          )}
        />
        <Table.Column
          title={t("companies.contacts.jobTitle")}
          dataIndex="jobTitle"
          ellipsis
          width={180}
          filterIcon={<SearchOutlined />}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Input placeholder={t("companies.contacts.searchTitle")} />
            </FilterDropdown>
          )}
        />
        <Table.Column<Contact>
          title={t("companies.contacts.stage")}
          dataIndex="status"
          width={150}
          render={(_, record) => {
            return <ContactStatusTag status={record.status} />;
          }}
          filterDropdown={(props) => (
            <FilterDropdown {...props}>
              <Select
                style={{ width: "200px" }}
                mode="multiple"
                placeholder={t("companies.contacts.selectStage")}
                options={statusOptions.map((option) => ({
                  ...option,
                  label: t(`enums.contactStatus.${option.value}`),
                }))}
              />
            </FilterDropdown>
          )}
        />
        <Table.Column<Contact>
          dataIndex="id"
          width={150}
          render={(value, record) => {
            return (
              <Space>
                <Button
                  size="small"
                  href={`mailto:${record.email}`}
                  icon={<MailOutlined />}
                />
                <Button
                  size="small"
                  href={`tel:${record.phone}`}
                  icon={<PhoneOutlined />}
                />
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
                  resource="contacts"
                  meta={{
                    gqlMutation: DELETE_CONTACT_MUTATION,
                  }}
                  onSuccess={invalidateContacts}
                />
              </Space>
            );
          }}
        />
      </Table>

      <ContactModal
        modalProps={createForm.modalProps}
        formProps={createForm.formProps}
        isEdit={false}
        companyId={companyId}
      />
      <ContactModal
        modalProps={editForm.modalProps}
        formProps={editForm.formProps}
        isEdit
        companyId={companyId}
      />
    </Card>
  );
};

const statusOptions: {
  label: string;
  value: Contact["status"];
}[] = [
  { label: "New", value: "NEW" },
  { label: "Qualified", value: "QUALIFIED" },
  { label: "Unqualified", value: "UNQUALIFIED" },
  { label: "Won", value: "WON" },
  { label: "Negotiation", value: "NEGOTIATION" },
  { label: "Lost", value: "LOST" },
  { label: "Interested", value: "INTERESTED" },
  { label: "Contacted", value: "CONTACTED" },
  { label: "Churned", value: "CHURNED" },
];

const stageOptions: {
  label: string;
  value: ContactStage;
}[] = [
  { label: "Lead", value: "LEAD" },
  { label: "Sales qualified lead", value: "SALES_QUALIFIED_LEAD" },
  { label: "Customer", value: "CUSTOMER" },
];
