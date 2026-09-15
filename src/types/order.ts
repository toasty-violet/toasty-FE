/** 결제가 끝나면 배송대기, 운송장이 등록되면 발송완료다. */
export type OrderStatus = "SHIPPING_PENDING" | "SHIPPED";

/** 주문 화면 위의 상태 칩. */
export type OrderStatusFilter = "ALL" | "SHIPPING_PENDING" | "SHIPPED";

export interface OrderCounts {
  all: number;
  shippingPending: number;
  shipped: number;
}

/** 구매자 주문내역과 셀러 주문탭의 카드 한 장이 같이 갖는 값. */
interface OrderSummary {
  orderId: number;
  status: OrderStatus;
  paidAt: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  totalAmount: number;
  /** 발송완료가 아니면 null. */
  courierName: string | null;
  trackingNumber: string | null;
}

interface OrdersPage<T> {
  /** 첫 요청에만 온다. 이어 받을 때는 null. */
  counts: OrderCounts | null;
  items: T[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface CustomerOrder extends OrderSummary {
  /** 산 스토어. 스토어 화면 진입에 쓴다. */
  sellerId: number;
  shopName: string;
}

export type CustomerOrdersPage = OrdersPage<CustomerOrder>;

export interface SellerOrder extends OrderSummary {
  /** 카드에 구매자 자리로 뜬다. */
  receiverName: string;
}

export type SellerOrdersPage = OrdersPage<SellerOrder>;

/** 주문 상세 화면이 구매자·셀러 모두 그리는 값. */
export interface OrderDetail {
  orderId: number;
  /** 화면에 보여주는 주문번호. */
  orderNumber: string;
  status: OrderStatus;
  productName: string;
  productImageUrl: string;
  quantity: number;
  receiverName: string;
  receiverPhone: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  paidAt: string;
  productPrice: number;
  shippingFee: number;
  totalAmount: number;
  courierName: string | null;
  trackingNumber: string | null;
}

export interface CustomerOrderDetail extends OrderDetail {
  sellerId: number;
  shopName: string;
}

export interface SellerOrderDetail extends OrderDetail {
  /** 운송장을 등록한 시각. 발송완료가 아니면 null. */
  shippedAt: string | null;
}

/** 택배사 드롭다운 한 칸. 등록할 때는 code 를 보낸다. */
export interface Courier {
  code: string;
  name: string;
}

export interface ShipmentRequest {
  courier: string;
  /** 하이픈 없이 10~20자리 숫자. */
  trackingNumber: string;
}

export const ORDER_ERROR_CODE = {
  NOT_FOUND: "ORDER_NOT_FOUND",
  /** 운송장은 한 번 등록하면 고칠 수 없다. */
  ALREADY_SHIPPED: "ORDER_ALREADY_SHIPPED",
} as const;
