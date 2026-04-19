import api from "./api";

export async function createComplaint(payload) {
  const { data } = await api.post("/complaints", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getMyComplaints(params = {}) {
  const { data } = await api.get("/complaints/my", { params });
  return data;
}
