import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function TechnicianDashboard() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    scanType: "RGB",
    region: "Frontal",
    scanImage: null,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, logout } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, scanImage: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const data = new FormData();
    data.append("patientName", formData.patientName);
    data.append("patientId", formData.patientId);
    data.append("scanType", formData.scanType);
    data.append("region", formData.region);
    data.append("scanImage", formData.scanImage);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Scan uploaded successfully!");
      setFormData({
        patientName: "",
        patientId: "",
        scanType: "RGB",
        region: "Frontal",
        scanImage: null,
      });
    } catch (error) {
      setError(error.response?.data?.error || "Upload failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Technician Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.email}</span>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload Patient Scan</h2>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Patient ID
            </label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Scan Type
            </label>
            <select
              name="scanType"
              value={formData.scanType}
              onChange={handleInputChange}
              className="w-full cursor-pointer px-3 py-2 border rounded-md"
            >
              <option value="RGB">RGB</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Region
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full cursor-pointer px-3 py-2 border rounded-md"
              required
            >
              <option value="Frontal">Frontal</option>
              <option value="Upper Arch">Upper Arch</option>
              <option value="Lower Arch">Lower Arch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Scan Image (JPG/PNG)
            </label>
            <input
              type="file"
              name="scanImage"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png"
              className="w-full cursor-pointer px-3 py-2 border rounded-md"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Scan"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TechnicianDashboard;
