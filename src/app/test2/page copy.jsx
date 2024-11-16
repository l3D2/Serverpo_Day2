"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CopyInput from "../components/copy";
import Chart from "../components/nChart";
import { useRouter } from "next/navigation";
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
const Dashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [isPlottable, setIsPlottable] = useState("true");
  const isPlottableRef = useRef(isPlottable);
  const [voltageData, setVoltageData] = useState([]); // Use useState for voltage data
  const [powerData, setPowerData] = useState([]); // Use useState for power data
  const [pressureData, setPressureData] = useState([]); // Use useState for pressure data
  const [forceData, setForceData] = useState([]); // Use useState for force data
  const [cycleCountData, setCycleCountData] = useState([]); // Use useState for cycle count data
  const [positionData, setPositionData] = useState([]); // Use useState for position data

  console.log("session", session);
  useEffect(() => {
    isPlottableRef.current = isPlottable;
  }, [isPlottable]);
  // WebSocket setup
  const setupWebSocket = () => {
    const socket = new WebSocket("ws://technest.ddns.net:8001/ws");

    socket.onopen = () => {
      console.log("WebSocket connected");
      if (apiKey) {
        socket.send(apiKey);
      }
    };

    socket.onmessage = (event) => {
      if (event.data === "Connection authorized") {
        console.log("Connection authorized");
      } else {
        const data = JSON.parse(event.data);
        console.log("Received data:", data);
        const result = {
          ts: Math.floor(Date.now() / 1000),
          power: data["Energy Consumption"].Power,
          voltage: {
            L1_GND: data["Voltage"]["L1-GND"],
            L2_GND: data["Voltage"]["L2-GND"],
            L3_GND: data["Voltage"]["L3-GND"],
          },
          pressure: data.Pressure,
          force: data.Force,
          cycle_count: data["Cycle Count"],
          PoP: data["Position of the Punch"],
        };

        if (isPlottableRef.current) {
          // Helper to update and reset data arrays
          const updateData = (setter, newEntry) => {
            setter((prevData) => {
              if (prevData.length >= 200) {
                return [newEntry]; // Start a new array if length is 200 or more
              }
              return [...prevData, newEntry];
            });
          };

          updateData(setVoltageData, {
            timestamp: new Date(result.ts * 1000).toLocaleTimeString(),
            L1_GND: result.voltage.L1_GND,
            L2_GND: result.voltage.L2_GND,
            L3_GND: result.voltage.L3_GND,
          });

          updateData(setPowerData, {
            timestamp: new Date(result.ts * 1000).toLocaleTimeString(),
            Power: result.power,
          });

          updateData(setPressureData, {
            timestamp: new Date(result.ts * 1000).toLocaleTimeString(),
            Pressure: result.pressure,
          });

          updateData(setForceData, {
            timestamp: new Date(result.ts * 1000).toLocaleTimeString(),
            Force: result.force,
          });

          updateData(setCycleCountData, {
            timestamp: new Date(result.ts * 1000).toLocaleTimeString(),
            count: result.cycle_count,
          });

          updateData(setPositionData, {
            timestamp: new Date(result.ts * 1000).toLocaleTimeString(),
            PoP: result.PoP,
          });
        }
      }
    };
    return socket;
  };
  const [count, setCount] = useState(0); // Initialize count state

  useEffect(() => {
    setCount(voltageData.length); // Update count whenever voltageData changes
  }, [voltageData]);

  useEffect(() => {
    if (apiKey) {
      const socket = setupWebSocket(); // Connect WebSocket when apiKey is available

      return () => {
        socket.close(); // Close WebSocket when component unmounts
      };
    }
  }, [apiKey]);

  // สำหรับ Voltage Data
  const voltageYAxisDomain = useMemo(() => {
    if (voltageData.length === 0) return [220, 240]; // Default range
    const allVoltages = voltageData.flatMap((d) => [
      d.L1_GND,
      d.L2_GND,
      d.L3_GND,
    ]);
    const minVoltage = Math.floor(Math.min(...allVoltages));
    const maxVoltage = Math.ceil(Math.max(...allVoltages));
    return [minVoltage - 1, maxVoltage + 1];
  }, [voltageData]);

  // สำหรับ Power Data
  const powerYAxisDomain = useMemo(() => {
    if (powerData.length === 0) return [0, 100]; // Default range
    const allPowerValues = powerData.map((d) => d.Power);
    const minPower = Math.floor(Math.min(...allPowerValues));
    const maxPower = Math.ceil(Math.max(...allPowerValues));
    return [minPower - 1, maxPower + 1];
  }, [powerData]);

  // สำหรับ Pressure Data
  const pressureYAxisDomain = useMemo(() => {
    if (pressureData.length === 0) return [0, 100]; // Default range
    const allPressures = pressureData.map((d) => d.Pressure);
    const minPressure = Math.floor(Math.min(...allPressures));
    const maxPressure = Math.ceil(Math.max(...allPressures));
    return [minPressure - 1, maxPressure + 1];
  }, [pressureData]);

  // สำหรับ Force Data
  const forceYAxisDomain = useMemo(() => {
    if (forceData.length === 0) return [0, 100]; // Default range
    const allForces = forceData.map((d) => d.Force);
    const minForce = Math.floor(Math.min(...allForces));
    const maxForce = Math.ceil(Math.max(...allForces));
    return [minForce - 1, maxForce + 1];
  }, [forceData]);

  // สำหรับ Cycle Count Data
  const cycleCountYAxisDomain = useMemo(() => {
    if (cycleCountData.length === 0) return [0, 100]; // Default range
    const allCycleCounts = cycleCountData.map((d) => d.count);
    const minCycleCount = Math.floor(Math.min(...allCycleCounts));
    const maxCycleCount = Math.ceil(Math.max(...allCycleCounts));
    return [minCycleCount - 1, maxCycleCount + 1];
  }, [cycleCountData]);

  // สำหรับ Position Data
  const positionYAxisDomain = useMemo(() => {
    if (positionData.length === 0) return [0, 100]; // Default range
    const allPositions = positionData.map((d) => d.PoP);
    const minPosition = Math.floor(Math.min(...allPositions));
    const maxPosition = Math.ceil(Math.max(...allPositions));
    return [minPosition - 1, maxPosition + 1];
  }, [positionData]);

  // useEffect(() => {
  //   // If session is not available, redirect to sign-in page
  //   if (status === "unauthenticated") {
  //     router.push("/auth/signin");
  //   }
  // }, [status, router]);

  // if (status === "loading") {
  //   return null; // Loading indicator
  // }

  // if (!session) {
  //   router.replace("/auth/signin");
  //   return null;
  // }
  // const date = new Date(session.expiresAt);
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

export default Dashboard;
