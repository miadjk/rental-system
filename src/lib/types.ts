export type DressStatus = "Available" | "Rented" | "Unavailable" | "Archived";
export type RentalStatus = "Rented" | "Returned";
export type ReturnCondition = "Good" | "Minor Damage" | "Damaged";

export interface Dress {
  id: string;
  dress_name: string;
  quantity: number;
  rental_price: number;
  date_added: string; // ISO yyyy-mm-dd
  status: DressStatus;
  created_at: string;
  updated_at: string;
}

export interface Rental {
  id: string;
  /** Typed by the owner in the Add Rent form — the source of truth for display. */
  dress_name: string;
  /** Linked inventory record when the name matches a dress (null for standalone rentals). */
  dress_id: string | null;
  customer_name: string;
  rental_date: string; // ISO
  expected_return_date: string; // ISO
  actual_return_date?: string;
  rental_fee: number;
  status: RentalStatus;
  condition?: ReturnCondition;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface ReturnRecord {
  id: string;
  rental_id: string;
  actual_return_date: string;
  condition: ReturnCondition;
  remarks: string;
  created_at: string;
}

// Derived display status for active rentals
export type ActiveRentalDisplay = "Rented" | "Due Today" | "Overdue";
