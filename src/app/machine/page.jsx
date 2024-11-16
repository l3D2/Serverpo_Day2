"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import Chart from "../components/nChart";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/Navbars/AdminNavbar.js";
import Sidebar from "../components/Sidebar/Sidebar.js";
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

  useEffect(() => {
    isPlottableRef.current = isPlottable;
  }, [isPlottable]);
  // WebSocket setup
  const setupWebSocket = () => {
    const socket = new WebSocket("ws://158.108.97.12:8000/ws");

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
        <AdminNavbar title={"Machine API"} />
        <div className="relative bg-blueGray-800 md:pt-15 pb-32 pt-12">
          <div className="px-4 md:px-10 mx-auto w-1/2">
            <div className="relative text-gray-500 focus-within:text-gray-900 mb-3">
              <div className="absolute inset-y-0 left-0 flex items-center px-3 rounded-l-lg border-gray-300 border-l pointer-events-none bg-gray-200">
                <svg
                  className="stroke-gray-500"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.5 9C16.5 9.82843 15.8284 10.5 15 10.5C14.1716 10.5 13.5 9.82843 13.5 9C13.5 8.17157 14.1716 7.5 15 7.5C15.8284 7.5 16.5 8.17157 16.5 9Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="my-path"
                  ></path>
                  <path
                    d="M9 16.5005L10.5 18.0003"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    className="my-path"
                  ></path>
                  <path
                    d="M14.6776 15.6C18.1694 15.6 21 12.7794 21 9.3C21 5.82061 18.1694 3 14.6776 3C11.1858 3 8.35518 5.82061 8.35518 9.3C8.35518 9.7716 8.35518 10.0074 8.30595 10.1584C8.28678 10.2173 8.27393 10.2482 8.2458 10.3033C8.17356 10.4448 8.04222 10.5757 7.77953 10.8374L3.5883 15.0138C3.29805 15.303 3.15292 15.4476 3.07646 15.6318C3 15.8159 3 16.0208 3 16.4305V19C3 19.9428 3 20.4142 3.29289 20.7071C3.58579 21 4.05719 21 5 21H7.52195C7.93301 21 8.13854 21 8.32314 20.9231C8.50774 20.8462 8.65247 20.7003 8.94195 20.4084L13.1362 16.1796C13.399 15.9147 13.5304 15.7822 13.6729 15.7094C13.7272 15.6817 13.7578 15.6689 13.8157 15.6499C13.9677 15.6 14.2043 15.6 14.6776 15.6Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="my-path"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                id="key"
                className="block w-full h-11 pr-5 pl-14 py-2.5 text-base font-normal shadow-xs text-gray-200 bg-transparent border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none"
                placeholder="Enter Key"
              ></input>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 rounded-r-lg border-gray-300 border-r bg-gray-200">
                <button
                  onClick={() =>
                    setApiKey(document.getElementById("key").value)
                  }
                >
                  Submit
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                className={`w-30 px-3 py-3 text-white rounded-md focus:outline-none duration-100 ease-in-out ${
                  isPlottable
                    ? "bg-red-400 hover:bg-red-500"
                    : "bg-green-400 hover:bg-green-500"
                }`}
                onClick={() => setIsPlottable((prev) => !prev)}
              >
                {isPlottable ? "Pause Graph" : "Resume Graph"}
              </button>
            </div>
          </div>
        </div>
        <div className="px-4 md:px-4 mx-auto w-full -m-24">
          <div className="grid grid-cols-2 gap-1">
            <div className="bg-white p-1">
              <Chart
                title="Voltage Chart"
                labels={{ x: "Time", y: "Voltage (V)" }}
                data={voltageData}
                yAxisDomain={voltageYAxisDomain}
                dataKey="timestamp"
                lines={[
                  { dataKey: "L1_GND", stroke: "#8884d8" },
                  { dataKey: "L2_GND", stroke: "#82ca9d" },
                  { dataKey: "L3_GND", stroke: "#ff7300" },
                ]}
              />
            </div>
            <div className="bg-white p-1">
              <Chart
                title="Power Chart"
                labels={{ x: "Time", y: "Power (W)" }}
                data={powerData}
                yAxisDomain={powerYAxisDomain}
                dataKey="timestamp"
                lines={[{ dataKey: "Power", stroke: "#8884d8" }]}
              />
            </div>
            <div className="bg-white p-1">
              <Chart
                title="Pressure Chart"
                labels={{ x: "Time", y: "Pressure (Pa)" }}
                data={pressureData}
                yAxisDomain={pressureYAxisDomain}
                dataKey="timestamp"
                lines={[{ dataKey: "Pressure", stroke: "#82ca9d" }]}
              />
            </div>
            <div className="bg-white p-1">
              <Chart
                title="Force Chart"
                labels={{ x: "Time", y: "Force (N)" }}
                data={forceData}
                yAxisDomain={forceYAxisDomain}
                dataKey="timestamp"
                lines={[{ dataKey: "Force", stroke: "#ff7300" }]}
              />
            </div>
            <div className="bg-white p-1">
              <Chart
                title="CycleCount Chart"
                labels={{ x: "Time", y: "Cycle Count" }}
                data={cycleCountData}
                yAxisDomain={cycleCountYAxisDomain}
                dataKey="timestamp"
                lines={[{ dataKey: "count", stroke: "#8884d8" }]}
              />
            </div>
            <div className="bg-white p-1">
              <Chart
                title="Position of Punch Chart"
                labels={{ x: "Time", y: "Position" }}
                data={positionData}
                yAxisDomain={positionYAxisDomain}
                dataKey="timestamp"
                lines={[{ dataKey: "PoP", stroke: "#82ca9d" }]}
              />
            </div>
          </div>
          {/* <FooterAdmin /> */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
