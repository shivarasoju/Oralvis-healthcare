import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

function DentistDashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/scans");
      setScans(response.data);
    } catch (error) {
      setError("Failed to fetch scans");
    }
    setLoading(false);
  };

  const downloadReport = async (scanId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/report/${scanId}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${scanId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError("Failed to download report");
    }
  };

  if (loading) return <div className="text-center py-8">Loading scans...</div>;
  if (error)
    return <div className="text-center py-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dentist Dashboard</h1>
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
        <h2 className="text-xl font-semibold mb-4">Patient Scans</h2>

        {scans.length === 0 ? (
          <p className="text-gray-600">No scans available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scans.map((scan) => (
              <div key={scan.id} className="border rounded-lg p-4">
                <img
                  src={scan.image_url}
                  alt={`Scan for ${scan.patient_name}`}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />

                <div className="space-y-1">
                  <p>
                    <strong>Patient:</strong> {scan.patient_name}
                  </p>
                  <p>
                    <strong>ID:</strong> {scan.patient_id}
                  </p>
                  <p>
                    <strong>Type:</strong> {scan.scan_type}
                  </p>
                  <p>
                    <strong>Region:</strong> {scan.region}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(scan.upload_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <a
                    href={scan.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-blue-500 text-white text-center py-2 rounded-md hover:bg-blue-600"
                  >
                    View Full Image
                  </a>

                  <button
                    onClick={() => downloadReport(scan.id)}
                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                  >
                    Download PDF Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DentistDashboard;
