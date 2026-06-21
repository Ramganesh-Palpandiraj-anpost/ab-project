export type Role = "admin" | "treasurer" | "viewer";
export type Member = { id: string; member_name: string; family_name: string | null; phone: string | null; status: "active" | "inactive"; annual_commitment?: number };
export type Donation = { id: string; member_id: string; member_name?: string; donation_year: number; amount: number; donation_type: string | null; payment_date: string | null; remarks: string | null };
export type Expense = { id: string; expense_date: string; amount: number; category: string | null; description: string | null };
