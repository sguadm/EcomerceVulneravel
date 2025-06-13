import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
}

export function ProductCard({ product, onViewProduct }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login necessário",
        description: "Faça login para adicionar produtos ao carrinho",
        variant: "destructive",
      });
      return;
    }

    addToCart({ productId: product.id, quantity: 1 });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(price));
  };

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div onClick={() => onViewProduct(product)}>
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.inStock ? (
                <Badge variant="outline" className="text-accent-green border-accent-green">
                  Em estoque
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Fora de estoque
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </div>
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAddingToCart}
          className="w-full bg-primary hover:bg-primary-hover"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAddingToCart ? "Adicionando..." : "Adicionar"}
        </Button>
      </div>
    </Card>
  );
}
