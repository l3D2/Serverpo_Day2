import React from "react";
import { useRouter } from "next/navigation";

//Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import InsightsIcon from "@mui/icons-material/Insights";
import ApiIcon from "@mui/icons-material/Api";
import TuneIcon from "@mui/icons-material/Tune";
import SourceIcon from "@mui/icons-material/Source";
export default function Sidebar() {
  const [collapseShow, setCollapseShow] = React.useState("hidden");
  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl bg-gray-800 flex flex-wrap items-center justify-between relative md:w-64 z-10 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          {/* Toggler */}
          <button
            className="cursor-pointer text-black dark:text-white opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          <a className="flex flex-col items-center w-full mt-1" href="#">
            <img src="/rmutt.png" alt="RMUTT" width={80} height={80} />
            <span className="text-lg font-bold mt-3">แม่แตมสั่งพ่อ</span>
          </a>
          {/* Collapse */}
          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            {/* Divider */}
            <hr className="my-2 md:min-w-full" />
            {/* Heading */}
            <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline text-center">
              Menu
            </h6>
            {/* Navigation */}
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <li className="items-center">
                <a
                  href="/machine"
                  className={
                    "text-xs uppercase py-3 font-bold inline-flex items-center"
                  }
                >
                  <ApiIcon sx={{ fontSize: "35px" }} />
                  <span className="ml-2 leading-none">Machine API</span>
                </a>
              </li>

              <li className="items-center">
                <a
                  href="/insight"
                  className={
                    "text-xs uppercase py-3 font-bold inline-flex items-center"
                  }
                >
                  <InsightsIcon sx={{ fontSize: "35px" }} />
                  <span className="ml-2 leading-none">Insight</span>
                </a>
              </li>

              <li className="items-center">
                <a
                  href="/files"
                  className={
                    "text-xs uppercase py-3 font-bold inline-flex items-center"
                  }
                >
                  <SourceIcon sx={{ fontSize: "35px" }} />
                  <span className="ml-2 leading-none">Files</span>
                </a>
              </li>
            </ul>

            {/* Divider */}
            <hr className="my-4 md:min-w-full" />
            {/* Heading */}
            <h6 className="md:min-w-full text-blueGray-500 text-xs uppercase font-bold block pt-1 pb-4 no-underline text-center">
              Raspberry Pi
            </h6>
            {/* Navigation */}

            <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mb-4">
              <li className="items-center">
                <a
                  href="/controlpanel"
                  className={
                    "text-xs uppercase py-3 font-bold inline-flex items-center"
                  }
                >
                  <TuneIcon sx={{ fontSize: "35px" }} />
                  <span className="ml-2 leading-none">Control Panel</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
