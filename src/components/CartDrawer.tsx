import { Minus, Plus, X, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const navigate = useNavigate();
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, clearCart } = useCart();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-card">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground font-sans">
            <ShoppingCart className="w-5 h-5" />
            Mon Panier ({items.length})
          </SheetTitle>
          <SheetDescription className="sr-only">
            Gérez les articles de votre panier avant de passer votre commande.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p>Votre panier est vide</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 items-start">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-md object-cover bg-secondary flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{product.name}</h4>
                    <p className="text-accent font-bold text-sm mt-1">
                      {product.price.toLocaleString()} CFA/{product.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => removeItem(product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-foreground whitespace-nowrap">
                      {(product.price * quantity).toLocaleString()} CFA
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold text-foreground">
                <span>Total</span>
                <span className="text-accent">{totalPrice.toLocaleString()} CFA</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
              >
                Commander maintenant
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={clearCart}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors py-2"
              >
                <Trash2 className="w-4 h-4" /> Vider le panier
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
