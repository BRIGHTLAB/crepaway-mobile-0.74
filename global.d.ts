declare module 'react-native-svg-circular-progress';

type Category = {
  id: number;
  alias: string;
  name: string;
  description: string | null;
  notes: string | null;
  image_url: string;
  mini_image_url: string;
  order: number;
  enabled: number;
  is_paused: number;
  paused_from_date: string | null;
  paused_to_date: string | null;
};

type Currency = {
  id: number;
  symbol: string;
  name: string;
  exchange: number;
  default: number;
};

type Item = {
  id: number;
  items_id: number;
  alias: string;
  categories_id: number;
  menu_categories_id: number;
  plu: string | null;
  price: number;
  is_available: number;
  paused_to_date: string | null;
  paused_from_date: string | null;
  is_paused: number;
  is_favorite: number;
  enabled: number;
  image_url: string | null;
  menu_item_order: number;
  name: string;
  description: string | null;
  order: number;
  branches_id: number;
  symbol: string;
  allergens?: any;
  tags: Tags[];
  taste_triad: TasteTriad[];
  modifier_groups: ModifierGroup[];
  isHiddenFromUser?: boolean | null;
};

type TasteTriad = {
  id: number;
  alias: string;
  title: string;
  description: string | null;
  hex_color: string;
  [];
  percentage: number;
};

type Tags = {
  id: number;
  name: string;
  icon_url: string;
  color: null;
  order: number;
  is_active: number;
};

type Offer = {
  id: number;
  menus: Menu[];
  title: string;
  description: string;
  image_url: string;
  url: string | null;
  start_date: string;
  end_date: string;
  enabled: number;
  created_at: string;
  updated_at: string;
};

type LegalContent = {
  title: string;
  description: string;
  content: string;
};

type ModifierGroup = {
  id: number;
  menu_items_id: number;
  modifier_groups_id: number;
  enabled: boolean;
  is_available: boolean;
  min_quantity: number;
  max_quantity: number;
  is_paused: boolean;
  paused_from_date: string | null;
  paused_to_date: string | null;
  paused_until: string | null;
  order: number | null;
  name: string;
  description: string | null;
  is_required: boolean;
  modifier_group_enabled: boolean;
  has_additional_charge: boolean;
  hide_label: boolean;
  collapsed: boolean;
  modifier_items: ModifierItem[];
};

type ModifierItem = {
  id: number;
  menu_items_modifier_groups_id: number;
  modifier_items_id: number;
  min_quantity: number;
  max_quantity: number;
  is_paused: boolean;
  paused_from_date: string | null;
  paused_to_date: string | null;
  paused_until: string | null;
  price: number;
  order: number | null;
  name: string;
  enabled: boolean;
  is_default: boolean;
  plu: string;
  modifier_item_enabled: boolean;
};

type Status = {
  id: number;
  key: string;
  name: string;
  color: string;
};

interface SelectedModifierItem {
  plu: string;
  id: number;
  price: number | null;
  quantity: number;
  modifier_items_id: number;
  name: string;
}

interface SelectedModifierGroup {
  id: number;
  modifier_groups_id: number;
  modifier_items: SelectedModifierItem[];
  name: string;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface OrderType {
  id: number;
  alias: 'delivery' | 'takeaway' | 'dine-in' | null;
  menu_type: 'delivery' | 'dine-in' | 'takeaway' | null;
  type_title: string;
  title: string;
  description: string;
}

interface Address {
  id: number;
  title: string;
  province_id: number;
  street_address: string;
  building: string;
  floor: string;
  apartment: string;
  additional_info: string;
  latitude: number;
  longitude: number;
  is_default: number;
  delivery_charge: number;
  branch: string;
  menu: string;
}

interface Branch {
  id: number;
  alias: string;
  name: string;
}



interface Profile {
  name: string;
  email: string;
  countries_id: number | null;
  username: string | null;
  dob: string;
  image_url: string | null;
  phone_number: string;
}

interface Allergen {
  id: number;
  name: string;
  has_allergy: number;
}

type Notification = {
  id: number;
  content: string;
  date: string;
  is_read: number;
};

type Checkout = {
  branch: string;
  order_type: string;
  date_added: string;
  branch_id: number;
  sub_total: number;
  delivery_charge: number;
  points_rewarded: number;
  summary: {
    original_sub_total: number;
    discounted_sub_total: number;
    delivery_charge: number;
    final_total: number;
    points_rewarded: number;
    promo_code_applied: string | null;
    total_discount?: number;
    discount_type?: string;
    discount_value?: number;
  };
};

type WaiterInstruction = {
  id: number;
  name: string;
  description: string;
  type: string;
};


interface Content {
  id: number;
  key: string;
  image_url: string | null;
  title: string | null;
  description: string | null;
}

