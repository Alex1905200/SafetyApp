import { Tables } from "../types/database.types";

type Location = Tables<"locations">;

export type GroupedHistory = {
  title: string;
  data: Location[];
};

export const groupHistoryByDate = (
  locations: Location[]
): GroupedHistory[] => {
  const groups: { [key: string]: Location[] } = {};
  const today = new Date().toDateString();
  const yesterday = new Date(
    new Date().setDate(new Date().getDate() - 1)
  ).toDateString();

  locations.forEach((loc) => {
    const date = new Date(loc.timestamp).toDateString();

    let key = date;
    if (date === today) key = "Hoy";
    else if (date === yesterday) key = "Ayer";

    if (!groups[key]) groups[key] = [];
    groups[key].push(loc);
  });

  return Object.keys(groups).map((key) => ({
    title: key,
    data: groups[key],
  }));
};
