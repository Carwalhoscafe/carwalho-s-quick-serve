import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, MIN_ORDER_VALUE } from "@/lib/cart";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function CartDrawer() {
  const { isOpen, setOpen, closeCart, withProducts, subtotal, setQty, remove, count } = useCart();

  const belowMin = subtotal > 0 && subtotal < MIN_ORDER_VALUE;
  const amountToMin = Math.max(0, MIN_ORDER_VALUE - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 border-r border-border bg-background p-0 sm:max-w-md"
      >
        <SheetHeader className="space-y-1 border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Your Cart
              {count > 0 && (
                <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {count}
                </span>
              )}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Review your items before checkout.
          </SheetDescription>
        </SheetHeader>

        {withProducts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Fresh coconuts and cold-pressed cane juice, ready when you are.
              </p>
            </div>
            <Button asChild onClick={closeCart}>
              <Link to="/menu">Browse menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ul className="space-y-5">
                {withProducts.map(({ product, qty, lineTotal }) => (
                  <li key={product.id} className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                      {product.id.startsWith("coconut") ? "🥥" : "🥤"}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium leading-tight text-foreground">
                            {product.name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatINR(product.price)} {product.unit}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(product.id)}
                          aria-label={`Remove ${product.name}`}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty - 1)}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-l-full text-foreground transition-colors hover:bg-muted"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty + 1)}
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-r-full text-foreground transition-colors hover:bg-muted"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatINR(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border bg-muted/30 px-6 py-5">
              {belowMin && (
                <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground">
                  Add <span className="font-semibold">{formatINR(amountToMin)}</span> more to reach the{" "}
                  {formatINR(MIN_ORDER_VALUE)} minimum order.
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatINR(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Delivery fee calculated at checkout.
              </p>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2">
                <Button asChild size="lg" disabled={belowMin} onClick={closeCart}>
                  <Link to="/checkout">
                    {belowMin ? `Minimum ${formatINR(MIN_ORDER_VALUE)}` : "Checkout"}
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" onClick={closeCart}>
                  <Link to="/menu">Continue shopping</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
