/** 결제가 끝나면 배송대기, 운송장이 등록되면 발송완료다. */
export type OrderStatus = "SHIPPING_PENDING" | "SHIPPED";

/** 주문 화면 위의 상태 칩. */
export type OrderStatusFilter = "ALL" | "SHIPPING_PENDING" | "SHIPPED";

export interface OrderCounts {
  all: number;
  shippingPending: number;
  shipped: number;
}

export interface CustomerOrder {
  orderId: number;
  status: OrderStatus;
  paidAt: string;
  /** 산 스토어. 스토어 화면 진입에 쓴다. */
  sellerId: number;
  shopName: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  totalAmount: number;
  /** 발송완료가 아니면 null. */
  courier: string | null;
  trackingNumber: string | null;
}

export interface CustomerOrdersPage {
  /** 첫 요청에만 온다. 이어 받을 때는 null. */
  counts: OrderCounts | null;
  items: CustomerOrder[];
  nextCursor: number | null;
  hasNext: boolean;
}

export interface CustomerOrderDetail {
  orderId: number;
  /** 화면에 보여주는 주문번호. */
  orderNumber: string;
  status: OrderStatus;
  sellerId: number;
  shopName: string;
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
  courier: string | null;
  trackingNumber: string | null;
}
