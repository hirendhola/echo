"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/api";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <Button onClick={() => addUser()}> Add User </Button>
        <h1 className="text-2xl font-bold">Hello World/app</h1>
        {users?.map((user) => (
          <p key={user._id}>{user.name}</p>
        ))}
      </div>
    </div>
  );
}
