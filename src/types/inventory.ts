// INVENTORY STATUS REQUEST (POST /inventory-status)

export interface InventoryStatusRequest {
  products: number[]; // Array of product IDs
  page?: {
    size?: number;
    number?: number; // Defaults to 1
  };
}

// INVENTORY STATUS RESPONSE

export interface InventoryStatusResponse {
  data: ProductInventory[];
}

export interface ProductInventory {
  id: number;
  status: 'Expired' | 'Upcoming';
  ticket_options: TicketOption[];
}

export interface TicketOption {
  id: number;
  ticket_category: number;
  name: string;
  price: number;
  available: boolean;
  max_purchase_qty: number;
  delivery_methods: number[];
}
