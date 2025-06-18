import { nanoid } from "nanoid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart.tsx";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function ShoppingCart() {
  const {
    cartItems,
    isOpen,
    setIsOpen,
    totalItems,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
    isLoading,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  /**
   * Lida com a finalização da compra de forma assíncrona e segura.
   * A mensagem de sucesso e o fechamento do carrinho só ocorrem
   * após a confirmação de que o carrinho foi limpo no servidor.
   */
  const handleCheckout = () => {
    const orderNumber = nanoid(10).toUpperCase();

    // Chama a função 'clearCart' (que é uma mutação) com callbacks específicos
    // para esta ação de finalização de compra.
    clearCart(undefined, {
      onSuccess: () => {
        // Este código só executa se a chamada ao servidor for bem-sucedida.
        toast({
          title: "Compra realizada com sucesso!",
          description: `O número do seu pedido é: ${orderNumber}`,
        });
        setIsOpen(false); // Fecha o painel do carrinho
      },
      onError: (error) => {
        // Lidando com possíveis erros durante a finalização.
        toast({
          title: "Erro ao finalizar a compra",
          description:
            error.message || "Não foi possível limpar o carrinho. Tente novamente.",
          variant: "destructive",
        });
      },
    });
  };

  if (!isAuthenticated) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrinho de Compras
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalItems}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-6 mb-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">
                  Seu carrinho está vazio
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Adicione produtos para começar a comprar.
                </p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 p-3 border rounded-lg"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity({
                            productId: item.productId,
                            quantity: item.quantity - 1,
                          })
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateQuantity({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          })
                        }
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-lg text-gray-900">Total:</span>
                <span className="text-2xl text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 font-medium py-3"
                  onClick={handleCheckout}
                >
                  Finalizar Compra
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => clearCart()}
                >
                  Limpar Carrinho
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
