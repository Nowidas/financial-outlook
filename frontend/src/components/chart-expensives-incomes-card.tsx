import { toast } from "react-hot-toast"
import axiosSesion from "./helpers/sesioninterceptor"
import { DataTable } from "./transactions-data-table"
import { useEffect, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from 'date-fns'
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
import { Line, LineChart, ResponsiveContainer, Tooltip, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis, Area, Legend, Bar } from "recharts"


export const ChartInOutcomesCard = () => {
  const [allTargets, setAllTargets] = useState([])
  const [data, setData] = useState([])

  const initTarget = () => {
    return axiosSesion
      .get('http://127.0.0.1:8000/transactions/?category=${target.name}&amount_min=0&value_date_after=${format(months[0], 'yyyy - MM - dd')}&value_date_before=${format(months[1], 'yyyy - MM - dd')}`)
        .then((resp) => {
          setAllTargets(resp.data.results.map((val) => ({ name: val.custom_name, is_checked: true })));
        })
  }

  const getYearIncomeOutcome = async () => {
    if (allTargets.length == 0) {
      return
    }
    const currentYear = new Date().getFullYear();

    // First day of the year
    const firstDayOfYear = new Date(currentYear, 0, 1);

    // Last day of the year
    const lastDayOfYear = new Date(currentYear, 11, 31);

    try {
      const initialResponse = await axiosSesion.get(`http://127.0.0.1:8000/transactions/?value_date_after=${format(firstDayOfYear, 'yyyy-MM-dd')}&value_date_before=${format(lastDayOfYear, 'yyyy-MM-dd')}`);
      const pageCount = Math.ceil(initialResponse.data.count / 10);

      const requests = Array.from({ length: pageCount }, (_, index) =>
        axiosSesion.get(`http://127.0.0.1:8000/transactions/?value_date_year=2023&page=${index + 1}`)
      );

      const responses = await Promise.all(requests);
      const allTransactions = responses.reduce((acc, res) => {
        acc.push(...res.data.results);
        return acc;
      }, []);

      const transformedArray = allTransactions.reduce((acc, entry) => {
        const month = new Date(entry.value_date).getMonth();
        const amount = entry.amount;
        const category = entry.account.category.custom_name;

        const existingMonth = acc.find(item => item.month === month);

        if (!existingMonth) {
          acc.push({ month, [category]: balance_after });
        } else {
          existingMonth[category] = balance_after;
        }

        return acc;
      }, []);

      // Process or use allTransactions here
      console.warn(allTransactions);
    } catch (error) {
      // Handle errors
      console.error("Error fetching transactions:", error);
    }

    const initResp = await axiosSesion.get()
    const requests = monthDays.map((months) => {
      return allTargets.map((target) => {
        return axiosSesion.get(`http://127.0.0.1:8000/transactions/?category=${target.name}&amount_min=0&value_date_after=${format(months[0], 'yyyy-MM-dd')}&value_date_before=${format(months[1], 'yyyy-MM-dd')}`)
          .then((resp) => {
            return {
              amount: resp.data.results[0]?.amount ?? 0,
              month: months[0].getMonth() + 1,
              category: target.name
            }
          })
      });
    });

    const responses = await Promise.all(requests.flat());
    console.warn(responses);

    const transformedArray = responses.reduce((acc, entry) => {
      const { month, category, balance_after } = entry;
      if (!balance_after) {
        return acc;
      }
      const existingMonth = acc.find(item => item.month === month);

      if (!existingMonth) {
        acc.push({ month, [category]: balance_after });
      } else {
        existingMonth[category] = balance_after;
      }

      return acc;
    }, []);
    console.warn(transformedArray);


    setData(transformedArray);
  }

  useEffect(() => {
    initTarget()
  }, [])

  useEffect(() => {
    getYearIncomeOutcome()
  }, [allTargets]);



  return (
    <>
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row space-y-0 ">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Incomes and Expenses</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Incomes and Expenses</CardDescription>
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
                            {allTargets.map((el, idx) => (
                              <div key={idx} className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {payload[idx].dataKey}
                                </span>
                                <span className="font-bold">
                                  {Intl.NumberFormat('pl-PL', {
                                    style: 'currency', currency: 'PLN',
                                  }).format(payload[idx].value)}
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
                        style: { fill: "hsl(var(--primary))", opacity: 0.25 },
                      }}
                      style={
                        {
                          stroke: "hsl(var(--primary))",
                          opacity: 0.8,
                        } as React.CSSProperties
                      }
                    />
                  )
                })}
                {data.length && <ReferenceLine y={0} stroke="hsl(var(--muted))" />}
                {data.length && <XAxis dataKey="month" opacity={0} tick={({ payload, x, y, index }) => (
                  <text x={x} y={y - 10} dy={16} fill="#666" textAnchor="middle">
                    {payload.value}
                  </text>
                )} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card >
    </>
  )
}