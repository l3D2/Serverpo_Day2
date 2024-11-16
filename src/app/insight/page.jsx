"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import DataTable from "../components/table.js";

const Table = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar title={"Insight"} />
        <div className="relative bg-blueGray-800 md:pt-15 pb-32 pt-12">
          <div className="px-4 md:px-10 w-full mt-2">
            <DataTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default Table;
