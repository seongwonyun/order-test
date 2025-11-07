import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantId: string;
  variantSize: string;
  variantPackaging: string;
  variantUnit: string;
  quantity: number;
  memo?: string;
  addedAt: Date;
}

interface OrderStore {
  items: OrderItem[];
  currentOrderId?: string;

  addItem: (item: Omit<OrderItem, "addedAt">) => void;
  updateItem: (
    productId: string,
    variantId: string,
    updates: Partial<OrderItem>
  ) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearItems: () => void;
  setCurrentOrderId: (id?: string) => void;
  getItemCount: () => number;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      items: [],
      currentOrderId: undefined,

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) =>
              i.productId === item.productId && i.variantId === item.variantId
          );

          if (existingIndex !== -1) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              ...item,
              addedAt: new Date(),
            };
            return { items: newItems };
          }

          return {
            items: [{ ...item, addedAt: new Date() }, ...state.items],
          };
        });
      },

      updateItem: (productId, variantId, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.variantId === variantId
              ? { ...item, ...updates }
              : item
          ),
        }));
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      clearItems: () => {
        set({ items: [], currentOrderId: undefined });
      },

      setCurrentOrderId: (id) => {
        set({ currentOrderId: id });
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "order-storage",
    }
  )
);
