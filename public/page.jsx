"use client";

import React, { useState, useEffect } from "react";
import mqtt from "mqtt";
import Swal from "sweetalert2";

export default function Home() {
  const [topic, setTopic] = useState(""); // The currently subscribed topic
  const [tempT, setTempT] = useState(""); // Temporary topic input
  const [tempM, setTempM] = useState(""); // Temporary message input
  const [sendT, setSendT] = useState(""); // Temporary topic input
  const [messages, setMessages] = useState([]); // List of incoming messages
  const [client, setClient] = useState(null); // MQTT client

  useEffect(() => {
    // Create MQTT client with authentication
    const mqttClient = mqtt.connect("ws://210.246.215.31:8083", {
      username: "tgr", // Replace with your MQTT username
      password: "tgr18", // Replace with your MQTT password
    });
    setClient(mqttClient);

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker with authentication");
    });

    mqttClient.on("message", (topic, message) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `Topic ${topic} >>> ${message.toString()}`,
      ]);
    });

    return () => {
      mqttClient.end();
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();

    if (client && sendT && tempM) {
      client.publish(sendT, tempM);
      console.log(`Sent message to topic: ${sendT} - ${tempM}`);
      Swal.fire({
        title: "Success!",
        text: `send ${tempM} to topic ${sendT}`,
        icon: "success",
        timer: 1500,
      });
      setTempM("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (client && tempT) {
      // Unsubscribe from the previous topic if there was one
      if (topic) {
        client.unsubscribe(topic, () => {
          console.log(`Unsubscribed from previous topic: ${topic}`);
        });
      }

      // Clear previous messages before subscribing to the new topic
      setMessages([]);

      // Update the topic state
      setTopic(tempT);

      // Subscribe to the new topic
      client.subscribe(tempT, (err) => {
        if (!err) {
          console.log(`Subscribed to topic: ${tempT}`);
        } else {
          console.error("Subscription error:", err);
        }
      });
      Swal.fire({
        title: "Success!",
        text: `Topic is ${tempT}`,
        icon: "success",
        timer: 1500,
      });
    }
  };

  return (
    <div className="bg-slate-500 h-screen p-2">
      <div className="flex justify-center">
        <form onSubmit={handleSend} className="w-2/4">
          <label
            htmlFor="topic"
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Topic:
          </label>
          <input
            type="text input"
            name="topic"
            placeholder="Enter topic"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e) => setSendT(e.target.value)}
          />
          <label
            htmlFor="message"
            class="block my-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Message:
          </label>
          <input
            type="text"
            id="message"
            value={tempM}
            onChange={(e) => setTempM(e.target.value)}
            placeholder="Enter message"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <div className="flex justify-center">
            <button
              type="submit"
              class="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              send message
            </button>
          </div>
        </form>
      </div>

      <br />
      <div className="mx-4">
        <form
          onSubmit={handleSubmit}
          className="flex justify-center items-center"
        >
          <input
            type="text"
            id="topic"
            value={tempT}
            onChange={(e) => setTempT(e.target.value)}
            placeholder="Enter topic"
            class="w-1/5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
          <button
            type="submit"
            class=" text-white ml-3 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Set Topic
          </button>
        </form>
        <div className="bg-slate-200 text-black mt-2 p-4 border-black rounded-xl">
          {messages.length > 0 ? (
            <ul className=" max-h-96 overflow-scroll">
              {messages.map((msg, index) => (
                <li className="my-1" key={index}>
                  {msg}
                </li>
              ))}
            </ul>
          ) : (
            <p>No messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
