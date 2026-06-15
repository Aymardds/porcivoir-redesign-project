import { describe, it, expect, vi } from "vitest";
import { generateInvoicePdf, InvoiceOrder } from "@/utils/generateInvoicePdf";

// Mock the logo asset import to avoid loading actual image files during test
vi.mock("@/assets/logo-porcivoir.png", () => ({
  default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
}));

describe("generateInvoicePdf", () => {
  const mockOrder: InvoiceOrder = {
    id: "d0e74eaa-1234-5678-abcd-ef1234567890",
    customer_name: "Jean Kouassi",
    customer_phone: "0787989887",
    shipping_address: "Riviera 3",
    shipping_area: "Abidjan - Cocody",
    total_amount: 7000,
    delivery_fee: 2000,
    payment_method: "cod",
    created_at: "2026-06-10T15:00:00Z",
    items: [
      {
        product_name: "Cotes",
        quantity: 1,
        unit_price: 5000,
        total_price: 5000,
      },
    ],
  };

  it("should generate a PDF data URI string successfully", () => {
    const result = generateInvoicePdf(mockOrder);
    expect(result).toBeTypeOf("string");
    expect(result.startsWith("data:application/pdf;")).toBe(true);
  });
});
