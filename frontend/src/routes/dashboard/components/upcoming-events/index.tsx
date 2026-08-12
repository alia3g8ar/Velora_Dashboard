import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useInvalidate, useList } from "@refinedev/core";
import type { GetFieldsFromList } from "@refinedev/nestjs-query";

import { CalendarOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  App,
  Badge,
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Select,
  Skeleton as AntdSkeleton,
  Space,
} from "antd";
import dayjs from "dayjs";

import { Text, VeloraDatePicker } from "@/components";
import type { DashboardCalendarUpcomingEventsQuery } from "@/graphql/types";
import { API_URL, dataProvider } from "@/providers/data";
import { formatDate } from "@/utilities";

import {
  CREATE_EVENT_MUTATION,
  DASHBOARD_CALENDAR_UPCOMING_EVENTS_QUERY,
  EVENT_CATEGORIES_QUERY,
  UPDATE_EVENT_MUTATION,
} from "./queries";

type UpcomingEvent = GetFieldsFromList<DashboardCalendarUpcomingEventsQuery> & {
  categoryId?: string | null;
};

type EventCategoryItem = { id: string; title: string };

const EVENT_COLORS = [
  "#1677FF",
  "#52C41A",
  "#FA8C16",
  "#F5222D",
  "#722ED1",
  "#13C2C2",
];

const EventModal = ({
  open,
  editing,
  onCancel,
  onSaved,
}: {
  open: boolean;
  editing: UpcomingEvent | null;
  onCancel: () => void;
  onSaved: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          title: editing.title,
          categoryId: editing.categoryId,
          color: editing.color ?? "#1677FF",
          startDate: dayjs(editing.startDate),
          endDate: dayjs(editing.endDate),
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editing, form]);

  const { data: categoriesData } = useList<EventCategoryItem>({
    resource: "eventCategories",
    pagination: { mode: "off" },
    meta: { gqlQuery: EVENT_CATEGORIES_QUERY },
  });
  const categories = categoriesData?.data ?? [];

  const pickerFormat = (value: dayjs.Dayjs) =>
    formatDate(value, "YYYY/MM/DD HH:mm", i18n.language);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        title: values.title,
        categoryId: values.categoryId,
        color: values.color ?? "#1677FF",
        startDate: (values.startDate as dayjs.Dayjs).toISOString(),
        endDate: (values.endDate as dayjs.Dayjs).toISOString(),
      };
      if (editing) {
        await dataProvider.custom({
          url: API_URL,
          method: "post",
          headers: {},
          meta: {
            variables: { input: { id: editing.id, update: payload } },
            gqlMutation: UPDATE_EVENT_MUTATION,
          },
        });
        message.success(t("dashboard.events.notifications.updated"));
      } else {
        await dataProvider.custom({
          url: API_URL,
          method: "post",
          headers: {},
          meta: {
            variables: { input: { event: payload } },
            gqlMutation: CREATE_EVENT_MUTATION,
          },
        });
        message.success(t("dashboard.events.notifications.created"));
      }
      form.resetFields();
      onSaved();
    } catch {
      message.error(t("dashboard.events.notifications.failed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText={t("common.save")}
      cancelText={t("common.cancel")}
      confirmLoading={saving}
      title={
        editing
          ? t("dashboard.events.editEvent")
          : t("dashboard.events.addEvent")
      }
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          color: "#1677FF",
          startDate: dayjs().add(1, "hour").startOf("hour"),
          endDate: dayjs().add(2, "hour").startOf("hour"),
        }}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label={t("dashboard.events.title")}
          name="title"
          rules={[
            { required: true, message: t("dashboard.events.titlePlaceholder") },
          ]}
        >
          <Input placeholder={t("dashboard.events.titlePlaceholder")} />
        </Form.Item>
        <Form.Item
          label={t("dashboard.events.category")}
          name="categoryId"
          rules={[{ required: true }]}
        >
          <Select
            placeholder={t("dashboard.events.categoryPlaceholder")}
            options={categories.map((category) => ({
              value: category.id,
              label: t(
                `dashboard.events.categories.${category.title}`,
                category.title,
              ),
            }))}
          />
        </Form.Item>
        <Space.Compact block>
          <Form.Item
            label={t("dashboard.events.startDate")}
            name="startDate"
            style={{ flex: 1 }}
            rules={[{ required: true }]}
          >
            <VeloraDatePicker
              style={{ width: "100%" }}
              showTime
              format={pickerFormat}
            />
          </Form.Item>
          <Form.Item
            label={t("dashboard.events.endDate")}
            name="endDate"
            style={{ flex: 1, marginInlineStart: 12 }}
            rules={[{ required: true }]}
          >
            <VeloraDatePicker
              style={{ width: "100%" }}
              showTime
              format={pickerFormat}
            />
          </Form.Item>
        </Space.Compact>
        <Form.Item label={t("dashboard.events.color")} name="color">
          <Select
            options={EVENT_COLORS.map((color) => ({
              value: color,
              label: (
                <Space size={8}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: color,
                    }}
                  />
                  {color}
                </Space>
              ),
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export const CalendarUpcomingEvents = () => {
  const { t, i18n } = useTranslation();
  const invalidate = useInvalidate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UpcomingEvent | null>(null);

  const { data, isLoading } = useList<UpcomingEvent>({
    resource: "events",
    pagination: {
      pageSize: 5,
    },
    sorters: [
      {
        field: "startDate",
        order: "asc",
      },
    ],
    filters: [
      {
        field: "startDate",
        operator: "gte",
        // The backend stores Gregorian dates; always format from an explicit
        // Gregorian instance so the Jalali calendar never leaks into queries.
        value: (dayjs().calendar?.("gregory") ?? dayjs()).format(
          "YYYY-MM-DD",
        ),
      },
    ],
    meta: {
      gqlQuery: DASHBOARD_CALENDAR_UPCOMING_EVENTS_QUERY,
    },
  });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (event: UpcomingEvent) => {
    setEditing(event);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    invalidate({
      resource: "events",
      invalidates: ["list", "many"],
    });
  };

  return (
    <Card
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      headStyle={{ padding: "8px 16px", flex: "0 0 auto" }}
      bodyStyle={{
        flex: 1,
        overflow: "auto",
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
          <CalendarOutlined />
          <Text size="sm" style={{ marginInlineStart: ".7rem" }}>
            {t("dashboard.upcomingEvents")}
          </Text>
        </div>
      }
      extra={
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          onClick={openCreate}
        >
          {t("dashboard.events.addEvent")}
        </Button>
      }
    >
      {isLoading ? (
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: 5 }).map((_, index) => ({
            id: index,
          }))}
          renderItem={() => {
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Badge color="transparent" />}
                  title={
                    <AntdSkeleton.Button
                      active
                      style={{
                        height: "14px",
                      }}
                    />
                  }
                  description={
                    <AntdSkeleton.Button
                      active
                      style={{
                        width: "300px",
                        marginTop: "8px",
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
          dataSource={data?.data || []}
          renderItem={(item) => {
            const renderDate = () => {
              const start = formatDate(
                item.startDate,
                "MMM DD, YYYY - HH:mm",
                i18n.language,
              );
              const end = formatDate(
                item.endDate,
                "MMM DD, YYYY - HH:mm",
                i18n.language,
              );

              return `${start} - ${end}`;
            };

            return (
              <List.Item
                style={{ cursor: "pointer" }}
                onClick={() => openEdit(item)}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    aria-label={t("common.edit")}
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(item);
                    }}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={<Badge color={item.color} />}
                  title={<Text size="xs">{`${renderDate()}`}</Text>}
                  description={
                    <Text ellipsis={{ tooltip: true }} strong>
                      {item.title}
                    </Text>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}

      {!isLoading && data?.data.length === 0 && <NoEvent />}

      <EventModal
        open={modalOpen}
        editing={editing}
        onCancel={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </Card>
  );
};

const NoEvent = () => {
  const { t } = useTranslation();

  return (
    <span
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "220px",
      }}
    >
      {t("dashboard.noUpcomingEvent")}
    </span>
  );
};
