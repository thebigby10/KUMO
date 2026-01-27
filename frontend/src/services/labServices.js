// services/labServices.js

import api from "./api.js";

// Get all labs (optional: filter by archived status)
export const getAllLabs = async () => {
  try {
    const url = "/api/labs";
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch labs"
    );
  }
};

// Get a specific lab by ID
export const getLabById = async (id) => {
  try {
    const res = await api.get(`/api/labs/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch lab"
    );
  }
};

// Create a new lab
export const createLab = async (data) => {
  try {
    const res = await api.post("/api/labs", data);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to create lab"
    );
  }
};

// Update entire lab
export const updateLab = async (id, data) => {
  try {
    const res = await api.put(`/api/labs/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update lab"
    );
  }
};

// Partially update lab
export const partialUpdateLab = async (id, data) => {
  try {
    const res = await api.patch(`/api/labs/${id}`, data);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to update lab"
    );
  }
};

// Archive a lab
export const archiveLab = async (id) => {
  try {
    const res = await api.patch(`/api/labs/${id}/archive`);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to archive lab"
    );
  }
};

// Activate an archived lab
export const activateLab = async (id) => {
  try {
    const res = await api.patch(`/api/labs/${id}/activate`);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to activate lab"
    );
  }
};

// Delete a lab
export const deleteLab = async (id) => {
  try {
    const res = await api.delete(`/api/labs/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to delete lab"
    );
  }
};
