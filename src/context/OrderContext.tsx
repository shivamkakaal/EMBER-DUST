"use client";

import React, { createContext, useContext, useState } from "react";
import { Product, PRODUCTS } from "@/lib/products";

interface OrderContextType {
  isModalOpen: boolean;
  selectedProduct: Product;
  selectedQuantity: number;
  openOrderModal: (product?: Product, quantity?: number) => void;
  closeOrderModal: () => void;
  setSelectedQuantity: (qty: number) => void;
  setSelectedProduct: (product: Product) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(5);

  const openOrderModal = (product?: Product, quantity?: number) => {
    if (product) setSelectedProduct(product);
    if (quantity !== undefined) setSelectedQuantity(quantity);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
  };

  return (
    <OrderContext.Provider
      value={{
        isModalOpen,
        selectedProduct,
        selectedQuantity,
        openOrderModal,
        closeOrderModal,
        setSelectedQuantity,
        setSelectedProduct,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}
