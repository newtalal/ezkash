import { z } from "zod";

export const transactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .refine(
      (n) => {
        const parts = n.toString().split(".");
        return !parts[1] || parts[1].length <= 3;
      },
      { message: "Amount can have at most 3 decimals" }
    ),
  category: z.string().trim().min(1, "Category is required"),
  paymentMethod: z.string().trim().min(1, "Payment method is required"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or less")
    .optional()
    .or(z.literal("")),
  date: z.date({ invalid_type_error: "Date is required" }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const formatZodError = (err: z.ZodError): string => {
  const first = err.errors[0];
  return first?.message ?? "Invalid input";
};