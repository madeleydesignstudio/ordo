import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: "http://localhost:4321",
  fetchOptions: {
    credentials: "include",
  },
});

export default authClient;
