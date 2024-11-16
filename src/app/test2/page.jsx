"use client";
import React from "react";
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
import HeaderStats from "../components/Headers/HeaderStats.js";
import FooterAdmin from "../components/Footers/FooterAdmin.js";
import CardLineChart from "../components/Cards/CardLineChart.js";
import CardPageVisits from "../components/Cards/CardPageVisits.js";
import CardSocialTraffic from "../components/Cards/CardSocialTraffic.js";
import CardSettings from "../components/Cards/CardSettings.js";
import CardProfile from "../components/Cards/CardProfile.js";
import CardTable from "../components/Cards/CardTable.js";
const test2 = () => {
  return (
    <>
      <Sidebar />
      <div className="relative md:ml-64 bg-blueGray-100">
        <AdminNavbar />
        {/* Header */}
        {/* <HeaderStats /> */}
        {/* <div className="px-4 md:px-10 mx-auto w-full -m-24">
          <div className="flex flex-wrap">
            <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
              <CardLineChart />
            </div>
            <div className="w-full xl:w-4/12 px-4">Other</div>
          </div>
          <div className="flex flex-wrap mt-4">
            <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4">
              <CardPageVisits />
            </div>
            <div className="w-full xl:w-4/12 px-4">
              <CardSocialTraffic />
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-full px-4">
              <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                Other
              </div>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-8/12 px-4">
              <CardSettings />
            </div>
            <div className="w-full lg:w-4/12 px-4">
              <CardProfile />
            </div>
          </div>
          <div className="flex flex-wrap mt-4">
            <div className="w-full mb-12 px-4">
              <CardTable />
            </div>
            <div className="w-full mb-12 px-4">
              <CardTable color="dark" />
            </div>
          </div>
          <FooterAdmin />
        </div> */}
      </div>
    </>
  );
};

export default test2;
