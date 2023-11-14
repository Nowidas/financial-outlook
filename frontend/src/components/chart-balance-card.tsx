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
import { DollarSign, FilterIcon, RefreshCcw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Line, LineChart, ResponsiveContainer, Tooltip, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Area, Legend } from "recharts"


export const ChartBalanceCard = () => {
  const [allTargets, setAllTargets] = useState([])
  const [data, setData] = useState([])

  const initTarget = () => {
    return axiosSesion
      .get('http://127.0.0.1:8000/category')
      .then((resp) => {
        setAllTargets(resp.data.results.map((val) => ({ name: val.custom_name, is_checked: true })));
      })
  }

  const getYearTransactions = async () => {
    if (allTargets.length == 0) {
      return
    }
    const initialResponse = await axiosSesion.get('http://127.0.0.1:8000/transactions/?value_date_year=2023');
    const pageCount = Math.ceil(initialResponse.data.count / 10);

    const requests = Array.from({ length: pageCount }, (_, index) =>
      axiosSesion.get(`http://127.0.0.1:8000/transactions/?value_date_year=2023&page=${index + 1}`)
    );

    const responses = await Promise.all(requests);
    const allTransactions = responses.reduce((acc, res) => {
      acc.push(...res.data.results);
      return acc;
    }, []);

    // Processing data to get balances for each category in each month
    const formattedData = [];

    allTransactions.forEach(transaction => {
      const date = new Date(transaction.value_date); // assuming there's a date property in the transaction object
      const month = date.getMonth() + 1; // +1 to convert from 0-indexed to 1-indexed month
      const category = transaction.account.agreements.category.custom_name; // assuming category information is present in transactions
      let existingMonth = formattedData.find(entry => entry.month === month);

      if (!existingMonth) {
        existingMonth = {
          month: month
        };
        formattedData.push(existingMonth);
      }

      if (!existingMonth[`${category}`]) {
        existingMonth[`${category}`] = 0;
      }

      existingMonth[`${category}`] += parseFloat(transaction.amount); // Assuming amount signifies balance change
    });
    // Now, formattedData contains the balances for each category in each month
    console.warn(formattedData)
    setData(formattedData);
  }

  useEffect(() => {
    initTarget()
  }, [])

  useEffect(() => {
    getYearTransactions()
  }, [allTargets]);



  return (
    <>
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row space-y-0 ">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Net profit</CardTitle>
          </div>
          <div className="flex flex-row space-x-1">
            <Button disabled={!data.length} variant="outline" className="p-1 w-10 h-10"><RefreshCcw /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            {[1, 2].map((el, idx) => (
                              <div key={idx} className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[idx].dataKey}
                                </span>
                                <span className="font-bold">
                                  {payload[idx].value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {data.length && Object.keys(data[0]).map((key, idx) => {
                  if (key == "month") {
                    return;
                  }
                  return (
                    <Line
                      key={idx}
                      type="monotone"
                      strokeWidth={2}
                      dataKey={key}
                      activeDot={{
                        r: 6,
                        style: { fill: "black", opacity: 0.25 },
                      }}
                      style={
                        {
                          stroke: "black",
                          opacity: 0.25,
                        } as React.CSSProperties
                      }
                    />
                  )
                })}
                {data.length && <ReferenceLine y={0} stroke="red" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card >
    </>
  )
}