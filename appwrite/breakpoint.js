import http from "k6/http";
import { sleep, check } from "k6";

// Command to run the script with a web dashboard
// K6_WEB_DASHBOARD=true k6 run breakpoint.js

// Scenario Description:
// This k6 performance test script simulates basic user behavior on an e-commerce platform.
// The scenario models a typical user interaction upon entering the platform:
//  1. Fetches user details (simulating the retrieval of account information after login)
//  2. Immediately after receiving user details, fetches a list of products (simulating the product feed on the home screen)
//  3. Waits (sleep) for 1 second, then repeats the process

// Note: The 1-second iteration cycle is atypical for normal user behavior, as users usually take more time between actions.
// In real-world scenarios, users would likely delay and there would also be background fetching and caching mechanisms in place to reduce the load on the server.
// However, this rapid iteration is intentional for breakpoint testing purposes, focusing on how the system performs under sustained, high-load conditions without the usual optimizations.

// Database Setup:
//  - The `products` table contains 25,000 entries
//  - The `users` table contains 5,000 entries
//
// Objective:
// The objective of this test is to observe the impact of increasing the number of concurrent users (Virtual Users, VUs) on the server performance.
// The goal is to determine how many users can be handled before the server experiences timeouts or freezes.

const URL_USER = `URL_GET_USER_DETAILS`;
const URL_PRODUCTS = `URL_GET_PRODUCTS`;

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
  // Fetch user details:
  // This simulates the action of a user retrieving their account information after logging in.
  // This could involve selecting and fetching details such as the user's name, email and preferences.
  const user = http.get(URL_USER);

  // Fetch products right after receiving user details:
  // This mimics the behavior of loading a list of products, as seen on the home screen of an e-commerce site.
  // The products are filtered by certain criteria (e.g., popularity, category) and fetched from a products table, simulating browsing.
  const products = http.get(URL_PRODUCTS);

  // Check if the response status for user and products is 200 (OK)
  check(user, { "user fetched user details": (r) => r.status === 200 });
  check(products, { "user fetched products": (r) => r.status === 200 });

  // Simulate a wait time of 1 second before repeating the process:
  // This delay represents a user pausing between actions, like browsing through products or navigating the site.
  // The 1-second cycle is faster than a typical user but is used here to create load for performance testing.
  sleep(1);
};
