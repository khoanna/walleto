import useAuthFetch from "./useAuthFetch";
import { useState } from "react";
export default function usePackage() {
  const [packageLoading, setPackageLoading] = useState(false);
  const { authFetch } = useAuthFetch();
  const getPackages = async () => {
    try {
      setPackageLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/package/list-package`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setPackageLoading(false);
    }
  };
  const createPackage = async (body: {
    packageName: string;
    description: string;
    price: number;
    durationDays: number;
    permissionNames: string[];
  }) => {
    try {
      setPackageLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/package/create-package`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPackageLoading(false);
    }
  };
  const updatePackage = async (
    idPackage: string,
    body: {
      packageName: string;
      description: string;
      price: number;
      durationDays: number;
      permissionNames: string[];
    }
  ) => {
    try {
      setPackageLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/package/update-package?idPackage=${idPackage}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPackageLoading(false);
    }
  };
  const deletePackage = async (idPackage: string) => {
    try {
      setPackageLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/package/delete-package?idPackage=${idPackage}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPackageLoading(false);
    }
  };
  return {
    packageLoading,
    getPackages,
    createPackage,
    updatePackage,
    deletePackage,
  };
}
