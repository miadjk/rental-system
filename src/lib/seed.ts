import type { Dress, Rental, ReturnRecord } from "./types";
import { daysAgoISO, daysFromNowISO } from "./storage";
import { nowISO, todayISO } from "./utils";

export function buildSeed(): {
  dresses: Dress[];
  rentals: Rental[];
  returns: ReturnRecord[];
} {
  const now = nowISO();
  const dresses: Dress[] = [
    {
      id: "dress_fitted_pink",
      dress_name: "Fitted Pink Dress",
      quantity: 1,
      rental_price: 350,
      date_added: daysAgoISO(19),
      status: "Available",
      created_at: now,
      updated_at: now,
    },
    {
      id: "dress_black_glitz",
      dress_name: "Black Glitz Dress",
      quantity: 1,
      rental_price: 350,
      date_added: daysAgoISO(19),
      status: "Rented",
      created_at: now,
      updated_at: now,
    },
    {
      id: "dress_valentina",
      dress_name: "Valentina Dress",
      quantity: 1,
      rental_price: 500,
      date_added: daysAgoISO(19),
      status: "Available",
      created_at: now,
      updated_at: now,
    },
  ];

  const rentals: Rental[] = [
    {
      id: "rental_bg_1",
      dress_name: "Black Glitz Dress",
      dress_id: "dress_black_glitz",
      customer_name: "Maria",
      rental_date: daysAgoISO(19),
      expected_return_date: daysAgoISO(18),
      actual_return_date: daysAgoISO(18),
      rental_fee: 350,
      status: "Returned",
      condition: "Good",
      remarks: "Returned on time.",
      created_at: now,
      updated_at: now,
    },
    {
      id: "rental_bg_2",
      dress_name: "Black Glitz Dress",
      dress_id: "dress_black_glitz",
      customer_name: "Ana",
      rental_date: daysAgoISO(15),
      expected_return_date: daysAgoISO(14),
      actual_return_date: daysAgoISO(14),
      rental_fee: 350,
      status: "Returned",
      condition: "Good",
      remarks: "",
      created_at: now,
      updated_at: now,
    },
    {
      id: "rental_bg_3",
      dress_name: "Black Glitz Dress",
      dress_id: "dress_black_glitz",
      customer_name: "Jenny",
      rental_date: daysAgoISO(7),
      expected_return_date: daysAgoISO(6),
      actual_return_date: daysAgoISO(6),
      rental_fee: 350,
      status: "Returned",
      condition: "Good",
      remarks: "",
      created_at: now,
      updated_at: now,
    },
    {
      id: "rental_bg_4",
      dress_name: "Black Glitz Dress",
      dress_id: "dress_black_glitz",
      customer_name: "Maria",
      rental_date: todayISO(),
      expected_return_date: daysFromNowISO(1),
      rental_fee: 350,
      status: "Rented",
      created_at: now,
      updated_at: now,
    },
  ];

  const returns: ReturnRecord[] = rentals
    .filter((r) => r.status === "Returned")
    .map((r) => ({
      id: `return_${r.id}`,
      rental_id: r.id,
      actual_return_date: r.actual_return_date ?? r.expected_return_date,
      condition: (r.condition ?? "Good") as ReturnRecord["condition"],
      remarks: r.remarks ?? "",
      created_at: now,
    }));

  return { dresses, rentals, returns };
}
