import http from "k6/http";
import { check } from "k6";

// Command to run the script with a web dashboard
// K6_WEB_DASHBOARD=true k6 run breakpoint.js

// Scenario Description:
// This k6 performance test script is designed to stress test a bare server by simulating increasing numbers of virtual users (VUs).
// VUs arrival simulation:
//  1. Each user sends a GET request to the specified URL ("Hello World" endpoint)
//  2. The response is checked to ensure that the server is functioning correctly (status code 200 and correct response body)
//  3. The process is repeated rapidly without waiting (sleep) to simulate a high-load environment

// Objective:
// The goal is to determine the server's breaking point: at what load (measured in concurrent users) it starts to experience failures, timeouts or crashes.
// This will help to identify the bare maximum number of users the server can handle under high-load conditions without any additional tools.

const URL = "URL_HELLO";

export const options = {
  scenarios: {
    breakpoint: {
      // The "ramping-vus" executor is used to gradually ramp up the number of VUs over time to simulate an increasing load.
      // https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/ramping-vus/
      executor: "ramping-vus",
      startVUs: 1,

      stages: [
        { duration: "30s", target: 1 }, // Warm-up: Maintain 1 VU for 30 seconds to prepare the server
        { duration: "30s", target: 50 }, // Ramp up to 50 VUs over 30 seconds
        { duration: "30s", target: 500 }, // Gradually increase to 500 VUs over next 30 seconds
        { duration: "30s", target: 1000 },
        { duration: "30s", target: 2000 },
        { duration: "30s", target: 3000 },
        { duration: "30s", target: 5000 },
        { duration: "30s", target: 10000 },
      ],

      gracefulRampDown: "1s",
    },
  },
};

export default () => {
  const res = http.get(URL);

  check(res, {
    "is status ok": (r) => r.status === 200,
    "is body same": (r) => r.body === `Hello Elysia`,
  });
};
