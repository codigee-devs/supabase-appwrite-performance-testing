import http from "k6/http";
import { sleep, check } from "k6";

// Command to run the script with a web dashboard:
// K6_WEB_DASHBOARD=true k6 run load_3rules.js

// Scenario Description:
// This k6 load test script simulates constant traffic from N virtual users (VUs) over 60 seconds.
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
// The objective of this test is to determine the maximum number of VUs at which the server operates optimally.
//
// Optimal performance is defined by the following criteria:
//  - 99% of users receive a successful response (status code 200).
//  - 99% of users receive a response within 1000ms.
//  - 95% of users receive a response within 500ms.
//  - 90% of users receive a response within 200ms.
//
// These thresholds align with industry standards to ensure an optimal user experience and server performance under load.

const URL_USER = `URL_GET_USER_DETAILS`;
const URL_PRODUCTS = `URL_GET_PRODUCTS`;
const VUS = 100;

export const options = {
  scenarios: {
    load_3rules: {
      // The "constant-vus" executor is used to provide the constant number of VUs over time.
      // https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/constant-vus/
      executor: "constant-vus",
      vus: VUS,
      duration: "60s",
    },
  },
  thresholds: {
    http_req_duration: ["p(99)<1000"], // 99% of the requests should have a response time below 1000ms
    http_req_duration: ["p(95)<500"], // 95% of the requests should complete within 500ms
    http_req_duration: ["p(90)<200"], // 90% of the requests should have a response time below 200ms
    http_req_failed: ["rate<0.01"], // Less than 1% of the requests should fail
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
