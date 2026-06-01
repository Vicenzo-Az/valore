import api from "@/lib/api";

export async function getHint(description: string): Promise<string | null> {
  if (!description || description.trim().length < 3) return null;
  try {
    const { data } = await api.get<{ category_id: string | null }>("/hints/", {
      params: { description: description.trim().toLowerCase() },
    });
    return data.category_id;
  } catch {
    return null;
  }
}
