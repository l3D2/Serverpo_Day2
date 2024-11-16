// "use client";
// import { useEffect, useState, useRef, useMemo } from "react";
// import axios from "axios";
// import isEqual from "lodash/isEqual";
// import Chart from "../components/chart";
// import SoundChart from "../components/soundchart";

// const YourComponent = () => {
//     const [data, setData] = useState([]); // Initialize data as an array
//   const [rawData, setRawData] = useState([]);
//   const [sound, setSound] = useState([]);
//   const previousDataRef = useRef([]); // Use ref to store previous data

//   const fetchItems = async () => {
//     try {
//       const response = await axios.get(
//         "http://210.246.215.31:1000/api/v1/getSound"
//       );

//       const newData = response.data;
//       console.log("New data fetched", newData);
//       // Compare new data with the previous data stored in ref
//       if (!isEqual(newData, previousDataRef.current)) {
//         console.log("Data differs from previous fetch!");

//         // Update the ref first
//         previousDataRef.current = newData;
//         const r = newData.map((data, index) => ({
//           ts: parseInt(data.ts),
//           sound: data.sound,
//         }));
//         console.log("Processed data", r);
//         setSound(r);
//         // Update state
//         setRawData(newData);
//         // Process sound data
//         const d = newData.reduce(
//           (acc, item) => {
//             acc.sound = acc.sound.concat(item.sound);
//             acc.ts = acc.ts.concat(item.ts);
//             return acc;
//           },
//           { ts: [], sound: [] }
//         );

//         const combinedData = d.sound.map((soundValue, index) => ({
//           index: index,
//           ts: parseInt(d.ts[index]),
//           sound: soundValue,
//         }));
//         console.log(combinedData);

//         setData(combinedData); // Set combinedData as the new data
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   useEffect(() => {
//     // Initial fetch
//     fetchItems();

//     // Set up interval for subsequent fetches
//     const intervalId = setInterval(fetchItems, 15 * 1000);

//     // Cleanup
//     return () => {
//       clearInterval(intervalId);
//       previousDataRef.current = []; // Reset ref on unmount
//     };
//   }, []); // Empty dependency array since we're using ref

//   const YAxisDomain = useMemo(() => {
//     if (data.length === 0) return [0, 100]; // Default range
//     const all = data.map((d) => d.sound);
//     const min = Math.floor(Math.min(...all));
//     const max = Math.ceil(Math.max(...all));
//     return [min - 1, max + 1];
//   }, [data]);

//   // Monitor changes to rawData for debugging
//   useEffect(() => {
//     console.log("Raw data updated:", rawData);
//   }, [rawData]);

//   return (
//     <div className="p-4 h-screen">
//       <Chart
//         title="Sound Chart"
//         labels={{ x: "Index", y: "SimpleRate" }}
//         data={data}
//         yAxisDomain={YAxisDomain}
//         dataKey="index" // Use the index of each `sound` value as the x-axis
//         lines={[
//           { dataKey: "sound", stroke: "#8884d8" }, // Plot only `sound` on the y-axis
//         ]}
//       />
//       <SoundChart data={sound} />
//     </div>
//   );
// };

// export default YourComponent;

"use client";
import { useEffect, useState, useMemo } from "react";
import mqtt from "mqtt";
import Chart from "../components/chart";

const YourComponent = () => {
  const [data, setData] = useState([]); // Store all incoming sound data in a single array

  useEffect(() => {
    const username = "tgr";
    const password = "tgr18";

    const client = mqtt.connect("ws://210.246.215.31:8083", {
      username: username,
      password: password,
    });

    client.on("connect", () => {
      console.log("MQTT WebSocket connected");
      client.subscribe("main/ws");
    });

    client.on("message", (topic, message) => {
      try {
        // Parse the message to get sound data
        const newSoundData = JSON.parse(message.toString());

        // Check if it's a valid array
        if (Array.isArray(newSoundData)) {
          setData((prevData) => [
            ...prevData,
            ...newSoundData.map((value, index) => ({
              time: ((prevData.length + index) / 48000).toFixed(2), // Calculate time in seconds with 2 decimal places
              sound: value,
            })),
          ]);
        }
      } catch (error) {
        console.error(
          "Failed to parse MQTT message:",
          error,
          message.toString()
        );
      }
    });

    client.on("error", (error) => {
      console.error("MQTT connection error:", error);
    });
  }, []);

  const YAxisDomain = useMemo(() => {
    if (data.length === 0) return [0, 100];
    const allValues = data.map((d) => d.sound);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    return [min - 1, max + 1];
  }, [data]);

  return (
    <div className="p-4 h-screen">
      <Chart
        title="Sound Chart"
        labels={{ x: "Time (s)", y: "Amplitude" }}
        data={data}
        yAxisDomain={YAxisDomain}
        dataKey="time" // Use calculated time as x-axis
        lines={[
          { dataKey: "sound", stroke: "#8884d8" }, // Plot sound on the y-axis
        ]}
      />
    </div>
  );
};

export default YourComponent;
