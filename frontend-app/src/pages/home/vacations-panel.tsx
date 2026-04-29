import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  columns,
  type VacacionPeriodo,
} from "@/pages/tables/vacations-data-table/columns";
import { DataTable } from "@/pages/tables/vacations-data-table/data-table";

export default function VacationsPanel() {
  const [vacationsData, setVacationsData] = useState<VacacionPeriodo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const fetchVacationData = useCallback(async () => {
    try{
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/capitalfarmer.co/api/v1/vacaciones/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      setVacationsData(response.data);
    } catch (error) {
      console.error("Error fetching vacation data:", error);
    } finally{
      setIsLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (token) {
      fetchVacationData();
    }
  }, [token, fetchVacationData]);

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Card group */}
          <div className="flex flex-col gap-6 mb-8 sm:flex-row"></div>
          <Card className="mb-8">
            <CardContent>
              <DataTable
                columns={columns}
                data={vacationsData}
                isLoading={isLoading}
              ></DataTable>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
