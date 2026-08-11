export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string };
};

export type Audit = {
  action: Scalars["String"]["output"];
  changes?: Maybe<Array<AuditChange>>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  targetEntity: Scalars["String"]["output"];
  targetId: Scalars["Float"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  user?: Maybe<User>;
  userId?: Maybe<Scalars["ID"]["output"]>;
};

export type AuditChange = {
  field: Scalars["String"]["output"];
  from?: Maybe<Scalars["String"]["output"]>;
  to?: Maybe<Scalars["String"]["output"]>;
};

export type AuditConnection = {
  /** Array of nodes. */
  nodes: Array<Audit>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type AuditFilter = {
  action?: InputMaybe<StringFieldComparison>;
  and?: InputMaybe<Array<AuditFilter>>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<AuditFilter>>;
  targetEntity?: InputMaybe<StringFieldComparison>;
  targetId?: InputMaybe<FloatFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
  user?: InputMaybe<AuditFilterUserFilter>;
  userId?: InputMaybe<IdFilterComparison>;
};

export type AuditFilterUserFilter = {
  and?: InputMaybe<Array<AuditFilterUserFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  email?: InputMaybe<StringFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  jobTitle?: InputMaybe<StringFieldComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<AuditFilterUserFilter>>;
  phone?: InputMaybe<StringFieldComparison>;
  role?: InputMaybe<RoleFilterComparison>;
  timezone?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type AuditSort = {
  direction: SortDirection;
  field: AuditSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type AuditSortFields =
  | "action"
  | "createdAt"
  | "id"
  | "targetEntity"
  | "targetId"
  | "updatedAt"
  | "userId";

export type AuthResponse = {
  accessToken: Scalars["String"]["output"];
  user: User;
};

export type BooleanFieldComparison = {
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type BusinessType = "B2B" | "B2C" | "B2G";

export type BusinessTypeFilterComparison = {
  eq?: InputMaybe<BusinessType>;
  gt?: InputMaybe<BusinessType>;
  gte?: InputMaybe<BusinessType>;
  iLike?: InputMaybe<BusinessType>;
  in?: InputMaybe<Array<BusinessType>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  like?: InputMaybe<BusinessType>;
  lt?: InputMaybe<BusinessType>;
  lte?: InputMaybe<BusinessType>;
  neq?: InputMaybe<BusinessType>;
  notILike?: InputMaybe<BusinessType>;
  notIn?: InputMaybe<Array<BusinessType>>;
  notLike?: InputMaybe<BusinessType>;
};

export type CheckListItem = {
  checked: Scalars["Boolean"]["output"];
  title: Scalars["String"]["output"];
};

export type ChecklistItemInput = {
  checked: Scalars["Boolean"]["input"];
  title: Scalars["String"]["input"];
};

export type Company = {
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  businessType?: Maybe<BusinessType>;
  companySize?: Maybe<CompanySize>;
  country?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  dealsAggregate: Array<DealAggregateResponse>;
  id: Scalars["ID"]["output"];
  industry?: Maybe<Industry>;
  name: Scalars["String"]["output"];
  salesOwner: User;
  salesOwnerId: Scalars["ID"]["output"];
  totalRevenue?: Maybe<Scalars["Int"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
  website?: Maybe<Scalars["String"]["output"]>;
};

export type CompanyConnection = {
  /** Array of nodes. */
  nodes: Array<Company>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type CompanyCreateInput = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  businessType?: InputMaybe<BusinessType>;
  companySize?: InputMaybe<CompanySize>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  industry?: InputMaybe<Industry>;
  name: Scalars["String"]["input"];
  salesOwnerId: Scalars["ID"]["input"];
  totalRevenue?: InputMaybe<Scalars["Int"]["input"]>;
  website?: InputMaybe<Scalars["String"]["input"]>;
};

export type CompanyDeleteResponse = {
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  businessType?: Maybe<BusinessType>;
  companySize?: Maybe<CompanySize>;
  country?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  id?: Maybe<Scalars["ID"]["output"]>;
  industry?: Maybe<Industry>;
  name?: Maybe<Scalars["String"]["output"]>;
  salesOwnerId?: Maybe<Scalars["ID"]["output"]>;
  totalRevenue?: Maybe<Scalars["Int"]["output"]>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  website?: Maybe<Scalars["String"]["output"]>;
};

export type CompanyFilter = {
  and?: InputMaybe<Array<CompanyFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  businessType?: InputMaybe<BusinessTypeFilterComparison>;
  companySize?: InputMaybe<CompanySizeFilterComparison>;
  country?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  industry?: InputMaybe<IndustryFilterComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<CompanyFilter>>;
  salesOwner?: InputMaybe<CompanyFilterUserFilter>;
  salesOwnerId?: InputMaybe<IdFilterComparison>;
  totalRevenue?: InputMaybe<IntFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
  website?: InputMaybe<StringFieldComparison>;
};

export type CompanyFilterUserFilter = {
  and?: InputMaybe<Array<CompanyFilterUserFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  email?: InputMaybe<StringFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  jobTitle?: InputMaybe<StringFieldComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<CompanyFilterUserFilter>>;
  phone?: InputMaybe<StringFieldComparison>;
  role?: InputMaybe<RoleFilterComparison>;
  timezone?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type CompanySize = "ENTERPRISE" | "LARGE" | "MEDIUM" | "SMALL";

export type CompanySizeFilterComparison = {
  eq?: InputMaybe<CompanySize>;
  gt?: InputMaybe<CompanySize>;
  gte?: InputMaybe<CompanySize>;
  iLike?: InputMaybe<CompanySize>;
  in?: InputMaybe<Array<CompanySize>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  like?: InputMaybe<CompanySize>;
  lt?: InputMaybe<CompanySize>;
  lte?: InputMaybe<CompanySize>;
  neq?: InputMaybe<CompanySize>;
  notILike?: InputMaybe<CompanySize>;
  notIn?: InputMaybe<Array<CompanySize>>;
  notLike?: InputMaybe<CompanySize>;
};

export type CompanySort = {
  direction: SortDirection;
  field: CompanySortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type CompanySortFields =
  | "avatarUrl"
  | "businessType"
  | "companySize"
  | "country"
  | "createdAt"
  | "id"
  | "industry"
  | "name"
  | "salesOwnerId"
  | "totalRevenue"
  | "updatedAt"
  | "website";

export type CompanyUpdateInput = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  businessType?: InputMaybe<BusinessType>;
  companySize?: InputMaybe<CompanySize>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  industry?: InputMaybe<Industry>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  salesOwnerId?: InputMaybe<Scalars["ID"]["input"]>;
  totalRevenue?: InputMaybe<Scalars["Int"]["input"]>;
  website?: InputMaybe<Scalars["String"]["input"]>;
};

export type Contact = {
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  company: Company;
  companyId: Scalars["ID"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  jobTitle?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  phone?: Maybe<Scalars["String"]["output"]>;
  salesOwner: User;
  salesOwnerId: Scalars["ID"]["output"];
  score?: Maybe<Scalars["Int"]["output"]>;
  stage: ContactStage;
  status: ContactStatus;
  timezone?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ContactConnection = {
  /** Array of nodes. */
  nodes: Array<Contact>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type ContactCreateInput = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  companyId: Scalars["ID"]["input"];
  email: Scalars["String"]["input"];
  jobTitle?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  phone?: InputMaybe<Scalars["String"]["input"]>;
  salesOwnerId: Scalars["ID"]["input"];
  score?: InputMaybe<Scalars["Int"]["input"]>;
  stage?: InputMaybe<ContactStage>;
  status?: InputMaybe<ContactStatus>;
  timezone?: InputMaybe<Scalars["String"]["input"]>;
};

export type ContactDeleteResponse = {
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  companyId?: Maybe<Scalars["ID"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["ID"]["output"]>;
  jobTitle?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  salesOwnerId?: Maybe<Scalars["ID"]["output"]>;
  score?: Maybe<Scalars["Int"]["output"]>;
  stage?: Maybe<ContactStage>;
  status?: Maybe<ContactStatus>;
  timezone?: Maybe<Scalars["String"]["output"]>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type ContactFilter = {
  and?: InputMaybe<Array<ContactFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  company?: InputMaybe<ContactFilterCompanyFilter>;
  companyId?: InputMaybe<IdFilterComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  email?: InputMaybe<StringFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  jobTitle?: InputMaybe<StringFieldComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<ContactFilter>>;
  phone?: InputMaybe<StringFieldComparison>;
  salesOwner?: InputMaybe<ContactFilterUserFilter>;
  salesOwnerId?: InputMaybe<IdFilterComparison>;
  score?: InputMaybe<IntFieldComparison>;
  stage?: InputMaybe<ContactStageFilterComparison>;
  status?: InputMaybe<ContactStatusFilterComparison>;
  timezone?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type ContactFilterCompanyFilter = {
  and?: InputMaybe<Array<ContactFilterCompanyFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  businessType?: InputMaybe<BusinessTypeFilterComparison>;
  companySize?: InputMaybe<CompanySizeFilterComparison>;
  country?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  industry?: InputMaybe<IndustryFilterComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<ContactFilterCompanyFilter>>;
  salesOwnerId?: InputMaybe<IdFilterComparison>;
  totalRevenue?: InputMaybe<IntFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
  website?: InputMaybe<StringFieldComparison>;
};

export type ContactFilterUserFilter = {
  and?: InputMaybe<Array<ContactFilterUserFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  email?: InputMaybe<StringFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  jobTitle?: InputMaybe<StringFieldComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<ContactFilterUserFilter>>;
  phone?: InputMaybe<StringFieldComparison>;
  role?: InputMaybe<RoleFilterComparison>;
  timezone?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type ContactSort = {
  direction: SortDirection;
  field: ContactSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type ContactSortFields =
  | "avatarUrl"
  | "companyId"
  | "createdAt"
  | "email"
  | "id"
  | "jobTitle"
  | "name"
  | "phone"
  | "salesOwnerId"
  | "score"
  | "stage"
  | "status"
  | "timezone"
  | "updatedAt";

export type ContactStage = "CUSTOMER" | "LEAD" | "SALES_QUALIFIED_LEAD";

export type ContactStageFilterComparison = {
  eq?: InputMaybe<ContactStage>;
  gt?: InputMaybe<ContactStage>;
  gte?: InputMaybe<ContactStage>;
  iLike?: InputMaybe<ContactStage>;
  in?: InputMaybe<Array<ContactStage>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  like?: InputMaybe<ContactStage>;
  lt?: InputMaybe<ContactStage>;
  lte?: InputMaybe<ContactStage>;
  neq?: InputMaybe<ContactStage>;
  notILike?: InputMaybe<ContactStage>;
  notIn?: InputMaybe<Array<ContactStage>>;
  notLike?: InputMaybe<ContactStage>;
};

export type ContactStatus =
  | "CHURNED"
  | "CONTACTED"
  | "INTERESTED"
  | "LOST"
  | "NEGOTIATION"
  | "NEW"
  | "QUALIFIED"
  | "UNQUALIFIED"
  | "WON";

export type ContactStatusFilterComparison = {
  eq?: InputMaybe<ContactStatus>;
  gt?: InputMaybe<ContactStatus>;
  gte?: InputMaybe<ContactStatus>;
  iLike?: InputMaybe<ContactStatus>;
  in?: InputMaybe<Array<ContactStatus>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  like?: InputMaybe<ContactStatus>;
  lt?: InputMaybe<ContactStatus>;
  lte?: InputMaybe<ContactStatus>;
  neq?: InputMaybe<ContactStatus>;
  notILike?: InputMaybe<ContactStatus>;
  notIn?: InputMaybe<Array<ContactStatus>>;
  notLike?: InputMaybe<ContactStatus>;
};

export type ContactUpdateInput = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  jobTitle?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
  salesOwnerId?: InputMaybe<Scalars["ID"]["input"]>;
  score?: InputMaybe<Scalars["Int"]["input"]>;
  stage?: InputMaybe<ContactStage>;
  status?: InputMaybe<ContactStatus>;
  timezone?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateOneCompanyInput = {
  /** The record to create */
  company: CompanyCreateInput;
};

export type CreateOneContactInput = {
  /** The record to create */
  contact: ContactCreateInput;
};

export type CreateOneDealInput = {
  /** The record to create */
  deal: DealCreateInput;
};

export type CreateOneTaskInput = {
  task: TaskCreateInput;
};

export type DateFieldComparison = {
  between?: InputMaybe<DateFieldComparisonBetween>;
  eq?: InputMaybe<Scalars["DateTime"]["input"]>;
  gt?: InputMaybe<Scalars["DateTime"]["input"]>;
  gte?: InputMaybe<Scalars["DateTime"]["input"]>;
  in?: InputMaybe<Array<Scalars["DateTime"]["input"]>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  lt?: InputMaybe<Scalars["DateTime"]["input"]>;
  lte?: InputMaybe<Scalars["DateTime"]["input"]>;
  neq?: InputMaybe<Scalars["DateTime"]["input"]>;
  notBetween?: InputMaybe<DateFieldComparisonBetween>;
  notIn?: InputMaybe<Array<Scalars["DateTime"]["input"]>>;
};

export type DateFieldComparisonBetween = {
  lower: Scalars["DateTime"]["input"];
  upper: Scalars["DateTime"]["input"];
};

export type Deal = {
  closeDate?: Maybe<Scalars["DateTime"]["output"]>;
  company: Company;
  companyId: Scalars["ID"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  dealContact?: Maybe<Contact>;
  dealContactId?: Maybe<Scalars["ID"]["output"]>;
  dealOwner: User;
  dealOwnerId: Scalars["ID"]["output"];
  id: Scalars["ID"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  stage?: Maybe<DealStage>;
  stageId?: Maybe<Scalars["ID"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  value?: Maybe<Scalars["Float"]["output"]>;
};

export type DealAggregateGroupBy = {
  closeDateDay?: Maybe<Scalars["Int"]["output"]>;
  closeDateMonth?: Maybe<Scalars["Int"]["output"]>;
  closeDateYear?: Maybe<Scalars["Int"]["output"]>;
};

export type DealAggregateResponse = {
  groupBy?: Maybe<DealAggregateGroupBy>;
  sum?: Maybe<DealSumAggregate>;
};

export type DealConnection = {
  /** Array of nodes. */
  nodes: Array<Deal>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type DealCreateInput = {
  closeDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  companyId: Scalars["ID"]["input"];
  dealContactId?: InputMaybe<Scalars["ID"]["input"]>;
  dealOwnerId: Scalars["ID"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  stageId?: InputMaybe<Scalars["ID"]["input"]>;
  title: Scalars["String"]["input"];
  value?: InputMaybe<Scalars["Float"]["input"]>;
};

export type DealDeleteResponse = {
  closeDate?: Maybe<Scalars["DateTime"]["output"]>;
  companyId?: Maybe<Scalars["ID"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  dealContactId?: Maybe<Scalars["ID"]["output"]>;
  dealOwnerId?: Maybe<Scalars["ID"]["output"]>;
  id?: Maybe<Scalars["ID"]["output"]>;
  notes?: Maybe<Scalars["String"]["output"]>;
  stageId?: Maybe<Scalars["ID"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
  value?: Maybe<Scalars["Float"]["output"]>;
};

export type DealFilter = {
  and?: InputMaybe<Array<DealFilter>>;
  closeDate?: InputMaybe<DateFieldComparison>;
  closeDateDay?: InputMaybe<IntFieldComparison>;
  closeDateMonth?: InputMaybe<IntFieldComparison>;
  closeDateYear?: InputMaybe<IntFieldComparison>;
  company?: InputMaybe<DealFilterCompanyFilter>;
  companyId?: InputMaybe<IdFilterComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  dealContact?: InputMaybe<DealFilterContactFilter>;
  dealContactId?: InputMaybe<IdFilterComparison>;
  dealOwner?: InputMaybe<DealFilterUserFilter>;
  dealOwnerId?: InputMaybe<IdFilterComparison>;
  id?: InputMaybe<IdFilterComparison>;
  notes?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<DealFilter>>;
  stage?: InputMaybe<DealFilterDealStageFilter>;
  stageId?: InputMaybe<IdFilterComparison>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
  value?: InputMaybe<FloatFieldComparison>;
};

export type DealFilterCompanyFilter = {
  and?: InputMaybe<Array<DealFilterCompanyFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  businessType?: InputMaybe<BusinessTypeFilterComparison>;
  companySize?: InputMaybe<CompanySizeFilterComparison>;
  country?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  industry?: InputMaybe<IndustryFilterComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<DealFilterCompanyFilter>>;
  salesOwnerId?: InputMaybe<IdFilterComparison>;
  totalRevenue?: InputMaybe<IntFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
  website?: InputMaybe<StringFieldComparison>;
};

export type DealFilterContactFilter = {
  and?: InputMaybe<Array<DealFilterContactFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  companyId?: InputMaybe<IdFilterComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  email?: InputMaybe<StringFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  jobTitle?: InputMaybe<StringFieldComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<DealFilterContactFilter>>;
  phone?: InputMaybe<StringFieldComparison>;
  salesOwnerId?: InputMaybe<IdFilterComparison>;
  score?: InputMaybe<IntFieldComparison>;
  stage?: InputMaybe<ContactStageFilterComparison>;
  status?: InputMaybe<ContactStatusFilterComparison>;
  timezone?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type DealFilterDealStageFilter = {
  and?: InputMaybe<Array<DealFilterDealStageFilter>>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<DealFilterDealStageFilter>>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type DealFilterUserFilter = {
  and?: InputMaybe<Array<DealFilterUserFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  email?: InputMaybe<StringFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  jobTitle?: InputMaybe<StringFieldComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<DealFilterUserFilter>>;
  phone?: InputMaybe<StringFieldComparison>;
  role?: InputMaybe<RoleFilterComparison>;
  timezone?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type DealSort = {
  direction: SortDirection;
  field: DealSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type DealSortFields =
  | "closeDate"
  | "closeDateDay"
  | "closeDateMonth"
  | "closeDateYear"
  | "companyId"
  | "createdAt"
  | "dealContactId"
  | "dealOwnerId"
  | "id"
  | "notes"
  | "stageId"
  | "title"
  | "updatedAt"
  | "value";

export type DealStage = {
  createdAt: Scalars["DateTime"]["output"];
  deals: Array<Deal>;
  dealsAggregate: Array<DealAggregateResponse>;
  id: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type DealStageDealsArgs = {
  filter?: DealFilter;
  sorting?: Array<DealSort>;
};

export type DealStageConnection = {
  /** Array of nodes. */
  nodes: Array<DealStage>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type DealStageFilter = {
  and?: InputMaybe<Array<DealStageFilter>>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<DealStageFilter>>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type DealStageSort = {
  direction: SortDirection;
  field: DealStageSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type DealStageSortFields = "createdAt" | "id" | "title" | "updatedAt";

export type DealSumAggregate = {
  value?: Maybe<Scalars["Float"]["output"]>;
};

export type DealUpdateInput = {
  closeDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  companyId?: InputMaybe<Scalars["ID"]["input"]>;
  dealContactId?: InputMaybe<Scalars["ID"]["input"]>;
  dealOwnerId?: InputMaybe<Scalars["ID"]["input"]>;
  notes?: InputMaybe<Scalars["String"]["input"]>;
  stageId?: InputMaybe<Scalars["ID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["Float"]["input"]>;
};

export type DeleteOneCompanyInput = {
  /** The id of the record to delete. */
  id: Scalars["ID"]["input"];
};

export type DeleteOneContactInput = {
  /** The id of the record to delete. */
  id: Scalars["ID"]["input"];
};

export type DeleteOneDealInput = {
  /** The id of the record to delete. */
  id: Scalars["ID"]["input"];
};

export type DeleteOneTaskInput = {
  /** The id of the record to delete. */
  id: Scalars["ID"]["input"];
};

export type DeleteOneUserInput = {
  /** The id of the record to delete. */
  id: Scalars["ID"]["input"];
};

export type Event = {
  category: EventCategory;
  categoryId: Scalars["ID"]["output"];
  color: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  endDate: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  participants: Array<User>;
  startDate: Scalars["DateTime"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type EventParticipantsArgs = {
  filter?: UserFilter;
  sorting?: Array<UserSort>;
};

export type EventCategory = {
  createdAt: Scalars["DateTime"]["output"];
  events: Array<Event>;
  id: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type EventCategoryEventsArgs = {
  filter?: EventFilter;
  sorting?: Array<EventSort>;
};

export type EventCategoryConnection = {
  /** Array of nodes. */
  nodes: Array<EventCategory>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type EventCategoryFilter = {
  and?: InputMaybe<Array<EventCategoryFilter>>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<EventCategoryFilter>>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type EventCategorySort = {
  direction: SortDirection;
  field: EventCategorySortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type EventCategorySortFields =
  | "createdAt"
  | "id"
  | "title"
  | "updatedAt";

export type EventConnection = {
  /** Array of nodes. */
  nodes: Array<Event>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type EventFilter = {
  and?: InputMaybe<Array<EventFilter>>;
  category?: InputMaybe<EventFilterEventCategoryFilter>;
  categoryId?: InputMaybe<IdFilterComparison>;
  color?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  description?: InputMaybe<StringFieldComparison>;
  endDate?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<EventFilter>>;
  startDate?: InputMaybe<DateFieldComparison>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type EventFilterEventCategoryFilter = {
  and?: InputMaybe<Array<EventFilterEventCategoryFilter>>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<EventFilterEventCategoryFilter>>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type EventSort = {
  direction: SortDirection;
  field: EventSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type EventSortFields =
  | "categoryId"
  | "color"
  | "createdAt"
  | "description"
  | "endDate"
  | "id"
  | "startDate"
  | "title"
  | "updatedAt";

export type FloatFieldComparison = {
  between?: InputMaybe<FloatFieldComparisonBetween>;
  eq?: InputMaybe<Scalars["Float"]["input"]>;
  gt?: InputMaybe<Scalars["Float"]["input"]>;
  gte?: InputMaybe<Scalars["Float"]["input"]>;
  in?: InputMaybe<Array<Scalars["Float"]["input"]>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  lt?: InputMaybe<Scalars["Float"]["input"]>;
  lte?: InputMaybe<Scalars["Float"]["input"]>;
  neq?: InputMaybe<Scalars["Float"]["input"]>;
  notBetween?: InputMaybe<FloatFieldComparisonBetween>;
  notIn?: InputMaybe<Array<Scalars["Float"]["input"]>>;
};

export type FloatFieldComparisonBetween = {
  lower: Scalars["Float"]["input"];
  upper: Scalars["Float"]["input"];
};

export type IdFilterComparison = {
  eq?: InputMaybe<Scalars["ID"]["input"]>;
  gt?: InputMaybe<Scalars["ID"]["input"]>;
  gte?: InputMaybe<Scalars["ID"]["input"]>;
  iLike?: InputMaybe<Scalars["ID"]["input"]>;
  in?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  like?: InputMaybe<Scalars["ID"]["input"]>;
  lt?: InputMaybe<Scalars["ID"]["input"]>;
  lte?: InputMaybe<Scalars["ID"]["input"]>;
  neq?: InputMaybe<Scalars["ID"]["input"]>;
  notILike?: InputMaybe<Scalars["ID"]["input"]>;
  notIn?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  notLike?: InputMaybe<Scalars["ID"]["input"]>;
};

export type Industry =
  | "AEROSPACE"
  | "AGRICULTURE"
  | "AUTOMOTIVE"
  | "CHEMICALS"
  | "CONSTRUCTION"
  | "DEFENSE"
  | "EDUCATION"
  | "ENERGY"
  | "FINANCIAL_SERVICES"
  | "FOOD_AND_BEVERAGE"
  | "GOVERNMENT"
  | "HEALTHCARE"
  | "HOSPITALITY"
  | "INDUSTRIAL_MANUFACTURING"
  | "INSURANCE"
  | "LIFE_SCIENCES"
  | "LOGISTICS"
  | "MEDIA"
  | "MINING"
  | "NONPROFIT"
  | "OTHER"
  | "PHARMACEUTICALS"
  | "PROFESSIONAL_SERVICES"
  | "REAL_ESTATE"
  | "RETAIL"
  | "TECHNOLOGY"
  | "TELECOMMUNICATIONS"
  | "TRANSPORTATION"
  | "UTILITIES";

export type IndustryFilterComparison = {
  eq?: InputMaybe<Industry>;
  gt?: InputMaybe<Industry>;
  gte?: InputMaybe<Industry>;
  iLike?: InputMaybe<Industry>;
  in?: InputMaybe<Array<Industry>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  like?: InputMaybe<Industry>;
  lt?: InputMaybe<Industry>;
  lte?: InputMaybe<Industry>;
  neq?: InputMaybe<Industry>;
  notILike?: InputMaybe<Industry>;
  notIn?: InputMaybe<Array<Industry>>;
  notLike?: InputMaybe<Industry>;
};

export type IntFieldComparison = {
  between?: InputMaybe<IntFieldComparisonBetween>;
  eq?: InputMaybe<Scalars["Int"]["input"]>;
  gt?: InputMaybe<Scalars["Int"]["input"]>;
  gte?: InputMaybe<Scalars["Int"]["input"]>;
  in?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  lt?: InputMaybe<Scalars["Int"]["input"]>;
  lte?: InputMaybe<Scalars["Int"]["input"]>;
  neq?: InputMaybe<Scalars["Int"]["input"]>;
  notBetween?: InputMaybe<IntFieldComparisonBetween>;
  notIn?: InputMaybe<Array<Scalars["Int"]["input"]>>;
};

export type IntFieldComparisonBetween = {
  lower: Scalars["Int"]["input"];
  upper: Scalars["Int"]["input"];
};

export type LoginInput = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export type Mutation = {
  createOneCompany: Company;
  createOneContact: Contact;
  createOneDeal: Deal;
  createOneTask: Task;
  deleteOneCompany: CompanyDeleteResponse;
  deleteOneContact: ContactDeleteResponse;
  deleteOneDeal: DealDeleteResponse;
  deleteOneTask: TaskDeleteResponse;
  deleteOneUser: UserDeleteResponse;
  login: AuthResponse;
  updateOneCompany: Company;
  updateOneContact: Contact;
  updateOneDeal: Deal;
  updateOneTask: Task;
  updateOneUser: User;
};

export type MutationCreateOneCompanyArgs = {
  input: CreateOneCompanyInput;
};

export type MutationCreateOneContactArgs = {
  input: CreateOneContactInput;
};

export type MutationCreateOneDealArgs = {
  input: CreateOneDealInput;
};

export type MutationCreateOneTaskArgs = {
  input: CreateOneTaskInput;
};

export type MutationDeleteOneCompanyArgs = {
  input: DeleteOneCompanyInput;
};

export type MutationDeleteOneContactArgs = {
  input: DeleteOneContactInput;
};

export type MutationDeleteOneDealArgs = {
  input: DeleteOneDealInput;
};

export type MutationDeleteOneTaskArgs = {
  input: DeleteOneTaskInput;
};

export type MutationDeleteOneUserArgs = {
  input: DeleteOneUserInput;
};

export type MutationLoginArgs = {
  loginInput: LoginInput;
};

export type MutationUpdateOneCompanyArgs = {
  input: UpdateOneCompanyInput;
};

export type MutationUpdateOneContactArgs = {
  input: UpdateOneContactInput;
};

export type MutationUpdateOneDealArgs = {
  input: UpdateOneDealInput;
};

export type MutationUpdateOneTaskArgs = {
  input: UpdateOneTaskInput;
};

export type MutationUpdateOneUserArgs = {
  input: UpdateOneUserInput;
};

export type OffsetPageInfo = {
  /** true if paging forward and there are more records. */
  hasNextPage?: Maybe<Scalars["Boolean"]["output"]>;
  /** true if paging backwards and there are more records. */
  hasPreviousPage?: Maybe<Scalars["Boolean"]["output"]>;
};

export type OffsetPaging = {
  /** Limit the number of records returned */
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  /** Offset to start returning records from */
  offset?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Query = {
  audit: Audit;
  audits: AuditConnection;
  companies: CompanyConnection;
  company: Company;
  contact: Contact;
  contacts: ContactConnection;
  deal: Deal;
  dealStage: DealStage;
  dealStages: DealStageConnection;
  deals: DealConnection;
  event: Event;
  eventCategories: EventCategoryConnection;
  eventCategory: EventCategory;
  events: EventConnection;
  me: User;
  task: Task;
  taskStage: TaskStage;
  taskStages: TaskStageConnection;
  tasks: TaskConnection;
  user: User;
  users: UserConnection;
};

export type QueryAuditArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryAuditsArgs = {
  filter?: AuditFilter;
  paging?: OffsetPaging;
  sorting?: Array<AuditSort>;
};

export type QueryCompaniesArgs = {
  filter?: CompanyFilter;
  paging?: OffsetPaging;
  sorting?: Array<CompanySort>;
};

export type QueryCompanyArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryContactArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryContactsArgs = {
  filter?: ContactFilter;
  paging?: OffsetPaging;
  sorting?: Array<ContactSort>;
};

export type QueryDealArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryDealStageArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryDealStagesArgs = {
  filter?: DealStageFilter;
  paging?: OffsetPaging;
  sorting?: Array<DealStageSort>;
};

export type QueryDealsArgs = {
  filter?: DealFilter;
  paging?: OffsetPaging;
  sorting?: Array<DealSort>;
};

export type QueryEventArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryEventCategoriesArgs = {
  filter?: EventCategoryFilter;
  paging?: OffsetPaging;
  sorting?: Array<EventCategorySort>;
};

export type QueryEventCategoryArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryEventsArgs = {
  filter?: EventFilter;
  paging?: OffsetPaging;
  sorting?: Array<EventSort>;
};

export type QueryTaskArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTaskStageArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTaskStagesArgs = {
  filter?: TaskStageFilter;
  paging?: OffsetPaging;
  sorting?: Array<TaskStageSort>;
};

export type QueryTasksArgs = {
  filter?: TaskFilter;
  paging?: OffsetPaging;
  sorting?: Array<TaskSort>;
};

export type QueryUserArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryUsersArgs = {
  filter?: UserFilter;
  paging?: OffsetPaging;
  sorting?: Array<UserSort>;
};

export type Role = "ADMIN" | "SALES_INTERN" | "SALES_MANAGER" | "SALES_PERSON";

export type RoleFilterComparison = {
  eq?: InputMaybe<Role>;
  gt?: InputMaybe<Role>;
  gte?: InputMaybe<Role>;
  iLike?: InputMaybe<Role>;
  in?: InputMaybe<Array<Role>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  like?: InputMaybe<Role>;
  lt?: InputMaybe<Role>;
  lte?: InputMaybe<Role>;
  neq?: InputMaybe<Role>;
  notILike?: InputMaybe<Role>;
  notIn?: InputMaybe<Array<Role>>;
  notLike?: InputMaybe<Role>;
};

/** Sort Directions */
export type SortDirection = "ASC" | "DESC";

/** Sort Nulls Options */
export type SortNulls = "NULLS_FIRST" | "NULLS_LAST";

export type StringFieldComparison = {
  eq?: InputMaybe<Scalars["String"]["input"]>;
  gt?: InputMaybe<Scalars["String"]["input"]>;
  gte?: InputMaybe<Scalars["String"]["input"]>;
  iLike?: InputMaybe<Scalars["String"]["input"]>;
  in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  is?: InputMaybe<Scalars["Boolean"]["input"]>;
  isNot?: InputMaybe<Scalars["Boolean"]["input"]>;
  like?: InputMaybe<Scalars["String"]["input"]>;
  lt?: InputMaybe<Scalars["String"]["input"]>;
  lte?: InputMaybe<Scalars["String"]["input"]>;
  neq?: InputMaybe<Scalars["String"]["input"]>;
  notILike?: InputMaybe<Scalars["String"]["input"]>;
  notIn?: InputMaybe<Array<Scalars["String"]["input"]>>;
  notLike?: InputMaybe<Scalars["String"]["input"]>;
};

export type Task = {
  checklist?: Maybe<Array<CheckListItem>>;
  completed: Scalars["Boolean"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  dueDate?: Maybe<Scalars["DateTime"]["output"]>;
  id: Scalars["ID"]["output"];
  stage?: Maybe<TaskStage>;
  stageId?: Maybe<Scalars["ID"]["output"]>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
  users: Array<User>;
};

export type TaskUsersArgs = {
  filter?: UserFilter;
  sorting?: Array<UserSort>;
};

export type TaskConnection = {
  /** Array of nodes. */
  nodes: Array<Task>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type TaskCreateInput = {
  checklist?: InputMaybe<Array<ChecklistItemInput>>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  stageId?: InputMaybe<Scalars["ID"]["input"]>;
  title: Scalars["String"]["input"];
  userIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
};

export type TaskDeleteResponse = {
  checklist?: Maybe<Array<CheckListItem>>;
  completed?: Maybe<Scalars["Boolean"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  dueDate?: Maybe<Scalars["DateTime"]["output"]>;
  id?: Maybe<Scalars["ID"]["output"]>;
  stageId?: Maybe<Scalars["ID"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type TaskFilter = {
  and?: InputMaybe<Array<TaskFilter>>;
  completed?: InputMaybe<BooleanFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  description?: InputMaybe<StringFieldComparison>;
  dueDate?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<TaskFilter>>;
  stage?: InputMaybe<TaskFilterTaskStageFilter>;
  stageId?: InputMaybe<IdFilterComparison>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type TaskFilterTaskStageFilter = {
  and?: InputMaybe<Array<TaskFilterTaskStageFilter>>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<TaskFilterTaskStageFilter>>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type TaskSort = {
  direction: SortDirection;
  field: TaskSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type TaskSortFields =
  | "completed"
  | "createdAt"
  | "description"
  | "dueDate"
  | "id"
  | "stageId"
  | "title"
  | "updatedAt";

export type TaskStage = {
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  tasks: Array<Task>;
  title: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type TaskStageTasksArgs = {
  filter?: TaskFilter;
  sorting?: Array<TaskSort>;
};

export type TaskStageConnection = {
  /** Array of nodes. */
  nodes: Array<TaskStage>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type TaskStageFilter = {
  and?: InputMaybe<Array<TaskStageFilter>>;
  createdAt?: InputMaybe<DateFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  or?: InputMaybe<Array<TaskStageFilter>>;
  title?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type TaskStageSort = {
  direction: SortDirection;
  field: TaskStageSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type TaskStageSortFields = "createdAt" | "id" | "title" | "updatedAt";

export type TaskUpdateInput = {
  checklist?: InputMaybe<Array<ChecklistItemInput>>;
  completed?: InputMaybe<Scalars["Boolean"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  dueDate?: InputMaybe<Scalars["DateTime"]["input"]>;
  stageId?: InputMaybe<Scalars["ID"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  userIds?: InputMaybe<Array<Scalars["ID"]["input"]>>;
};

export type UpdateOneCompanyInput = {
  /** The id of the record to update */
  id: Scalars["ID"]["input"];
  /** The update to apply. */
  update: CompanyUpdateInput;
};

export type UpdateOneContactInput = {
  /** The id of the record to update */
  id: Scalars["ID"]["input"];
  /** The update to apply. */
  update: ContactUpdateInput;
};

export type UpdateOneDealInput = {
  /** The id of the record to update */
  id: Scalars["ID"]["input"];
  /** The update to apply. */
  update: DealUpdateInput;
};

export type UpdateOneTaskInput = {
  id: Scalars["ID"]["input"];
  update: TaskUpdateInput;
};

export type UpdateOneUserInput = {
  /** The id of the record to update */
  id: Scalars["ID"]["input"];
  /** The update to apply. */
  update: UserUpdateInput;
};

export type User = {
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  email: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  jobTitle?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  role: Role;
  timezone?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type UserConnection = {
  /** Array of nodes. */
  nodes: Array<User>;
  /** Paging information */
  pageInfo: OffsetPageInfo;
  /** Fetch total count of records */
  totalCount: Scalars["Int"]["output"];
};

export type UserDeleteResponse = {
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["DateTime"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["ID"]["output"]>;
  jobTitle?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  role?: Maybe<Role>;
  timezone?: Maybe<Scalars["String"]["output"]>;
  updatedAt?: Maybe<Scalars["DateTime"]["output"]>;
};

export type UserFilter = {
  and?: InputMaybe<Array<UserFilter>>;
  avatarUrl?: InputMaybe<StringFieldComparison>;
  createdAt?: InputMaybe<DateFieldComparison>;
  email?: InputMaybe<StringFieldComparison>;
  id?: InputMaybe<IdFilterComparison>;
  jobTitle?: InputMaybe<StringFieldComparison>;
  name?: InputMaybe<StringFieldComparison>;
  or?: InputMaybe<Array<UserFilter>>;
  phone?: InputMaybe<StringFieldComparison>;
  role?: InputMaybe<RoleFilterComparison>;
  timezone?: InputMaybe<StringFieldComparison>;
  updatedAt?: InputMaybe<DateFieldComparison>;
};

export type UserSort = {
  direction: SortDirection;
  field: UserSortFields;
  nulls?: InputMaybe<SortNulls>;
};

export type UserSortFields =
  | "avatarUrl"
  | "createdAt"
  | "email"
  | "id"
  | "jobTitle"
  | "name"
  | "phone"
  | "role"
  | "timezone"
  | "updatedAt";

export type UserUpdateInput = {
  avatarUrl?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  jobTitle?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  phone?: InputMaybe<Scalars["String"]["input"]>;
  role?: InputMaybe<Role>;
  timezone?: InputMaybe<Scalars["String"]["input"]>;
};
