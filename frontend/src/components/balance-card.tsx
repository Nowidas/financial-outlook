import { toast } from "react-hot-toast"
import axiosSesion from "./helpers/sesioninterceptor"
import { DataTable } from "./transactions-data-table"
import { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button"
import { RefreshCcw } from "lucide-react"

const getBalances = async (target: string[]) => {
  const data = [
    {
      name: 'pko_Ł',
      balance: 12345,
    },
    {
      name: 'pko_K',
      balance: 666,
    },
  ]
  const filtered_data = data.filter((val) => val.name.includes(target))
  return filtered_data
}

export const BalanceCard = () => {
  const [target, setTarget] = useState(['pko_Ł', 'pko_K'])
  const [data, setData] = useState([])

  useEffect(() => {
    if (!data.length) {
      return;
    }
    const fetchDataAndHandleErrors = async () => {
      try {
        await getBalances(target);
      } catch (error) {
        console.error("Error fetching data: CategoryData");
        toast.error('Error fetching categories')
      }
    };
    fetchDataAndHandleErrors();
  }, []);

  useEffect(() => {
    console.warn(target);
    console.warn(data);
    if (target.length || data.length) {
      return;
    }
    const data = getBalances(target)
    setData(data)
  }, [data])


  return (
    <>
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row space-y-0">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Accounts Balance</CardTitle>
            {/* <CardDescription className="text-sm text-muted-foreground">All fetched transactions from connected accounts</CardDescription> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 m-4">
            {data.length ? data?.map((el) => (
              <div>
                <div>{el.name}</div>
                <div>{el.balance}</div>
              </div>
            )) : "wat"}
          </div>
        </CardContent>
      </Card>
    </>
  )
}