import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Product, CartItem } from "@shared/schema";

interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface CartContextType {
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  totalItems: number;
  totalPrice: number;
  addToCart: (data: { productId: number; quantity?: number }) => void;
  isAddingToCart: boolean;
  updateQuantity: (data: { productId: number; quantity: number }) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getAuthToken = useCallback(() => authService.getToken(), []);

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart", getAuthToken()],
    enabled: !!getAuthToken(),
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return [];

      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          return [];
        }
        throw new Error("Falha ao buscar carrinho");
      }
      return response.json();
    },
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", getAuthToken()] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro na operação.",
        variant: "destructive",
      });
    },
  };

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: number;
      quantity?: number;
    }) => {
      const token = getAuthToken();
      if (!token) throw new Error("Autenticação necessária");
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error("Falha ao adicionar ao carrinho");
      return response.json();
    },
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast({
        title: "Produto adicionado!",
        description: "Item adicionado ao carrinho com sucesso.",
      });
      setIsOpen(true);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => {
      const token = getAuthToken();
      if (!token) throw new Error("Autenticação necessária");
      const response = await fetch(`/api/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) throw new Error("Falha ao atualizar o carrinho");
      return response.json();
    },
    ...mutationOptions,
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      const token = getAuthToken();
      if (!token) throw new Error("Autenticação necessária");
      const response = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Falha ao remover do carrinho");
      return response.json();
    },
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast({
        title: "Produto removido",
        description: "Item removido do carrinho.",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const token = getAuthToken();
      if (!token) throw new Error("Autenticação necessária");
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Falha ao limpar o carrinho");
      return response.json();
    },
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      toast({
        title: "Carrinho limpo",
        description: "Todos os itens foram removidos.",
      });
    },
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  const value: CartContextType = {
    cartItems,
    isLoading,
    isOpen,
    setIsOpen,
    totalItems,
    totalPrice,
    addToCart: addToCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
