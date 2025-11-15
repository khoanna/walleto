"use client";

import { saveToken, getToken } from "@/services/Token";
import useAuth from "@/services/useAuth";
import { decodeJWT } from "@/services/JwtDecoder";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  idUser: string;
  name: string;
  email: string;
}

interface UserContext {
  user: User | undefined;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  isLoading: boolean;
  permissions: string[] | undefined;
  refreshUser: () => Promise<void>;
}

const userContext = createContext<UserContext | undefined>(undefined);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<string[] | undefined>(
    undefined
  );

  const { refresh } = useAuth();

  const fetchToken = async () => {
    try {
      setIsLoading(true);
      const data = await refresh();
      const token = data?.data?.token;
      saveToken(token);
      setUser(data?.data?.infUser);

      // Decode token to extract permissions
      if (token) {
        const decoded = decodeJWT(token);
        setPermissions(decoded?.permissions || []);
      }
    } catch (error) {
      setUser(undefined);
      setPermissions(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  // Also decode token on initial load if it exists
  useEffect(() => {
    const token = getToken();
    if (token && !permissions) {
      const decoded = decodeJWT(token);
      setPermissions(decoded?.permissions || []);
    }
  }, []);

  const userState = {
    user,
    setUser,
    isLoading,
    permissions,
    refreshUser: fetchToken,
  };

  return (
    <userContext.Provider value={userState}>{children}</userContext.Provider>
  );
};

export const useUserContext = () => useContext(userContext);
