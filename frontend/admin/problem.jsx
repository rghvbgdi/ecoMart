import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {

  console.log( "adarsh")

  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAdmin = async () => {

 

    try {



      const token = localStorage.getItem("token");
    // const token = 90 
      console.log(token , "adarsh")

      if (!token) {
        setIsAdmin(false);
        return;
      }


      const response = await axios.get("http://localhost:8000/admin/problems", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Admin check failed:", err.response?.data?.message || err.message);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  if (loading) return <div className="p-6 text-gray-700">Checking admin privileges...</div>;

  if (!isAdmin) {
    return <div className="p-6 text-red-600 font-semibold text-xl">Unauthorized Access</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700 mb-4">Welcome, Admin 👋</h1>
      <p className="text-gray-700">You have access to this admin-only page.</p>

      {/* You can render dummy data or tools here */}
      <div className="mt-6 p-4 bg-gray-100 rounded shadow">
        <p className="font-medium">✅ Dummy problem admin panel goes here</p>
      </div>
    </div>
  );
};

export default AdminPage;