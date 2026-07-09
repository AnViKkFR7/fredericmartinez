export interface RawAttributeDefinition {
  key: string
  data_type: string
}

export interface RawAttributeValue {
  value_text: string | null
  value_number: number | null
  value_boolean: boolean | null
  value_date: string | null
  value_json: unknown
  value_text_array: string[] | null
  value_number_array: number[] | null
  attribute_definitions: RawAttributeDefinition | null
}

export interface RawItem {
  id: string
  title: string
  summary: string | null
  status: string
  item_type: string
  attribute_values: RawAttributeValue[]
  item_media: ItemMediaFromDB[]
}

export interface ItemMediaFromDB {
  id: string;
  item_id: string;
  file_type: 'image' | 'pdf' | 'other';
  url_externa: string;
  title: string | null;
  alt_text: string | null;
  sort_order: number;
  metadata: any;
  created_at: string;
}

export type AttributeMap = Record<string, string | number | boolean | string[] | number[] | unknown | null>

export interface WebSection {
  id: string
  title: string
  attrs: AttributeMap
}

export interface ProjectCase {
  id: string
  title: string
  order: number
  client: string
  description: string
  result: string
  tags: string[]
  media: ItemMediaFromDB[]
}

export interface WebService {
  id: string
  title: string
  order: number
  description: string
  que_se_hacer: string[]
}

export interface TrayectoriaSlide {
  id: string;
  category: string;
  institution: string;
  order: string;
  title: string;
  years: string;
  color: "dark" | "blue";
}

