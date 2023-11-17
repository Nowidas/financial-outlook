import axiosSesion from "./helpers/sesioninterceptor"
import { useEffect, useState } from "react"
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button"
import { RefreshCcw } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, ReferenceLine, XAxis, } from "recharts"


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
    const targetYear = new Date().getFullYear();
    const monthDays = Array.from({ length: 12 }, (_, index) => {
      const firstDay = new Date(targetYear, index, 1);
      const lastDay = new Date(targetYear, index + 1, 0);
      return [firstDay, lastDay];

    });
    const requests = monthDays.map((months) => {
      return allTargets.map((target) => {
        return axiosSesion.get(`http://127.0.0.1:8000/transactions/?category=${target.name}&value_date_after=${format(months[0], 'yyyy-MM-dd')}&value_date_before=${format(months[1], 'yyyy-MM-dd')}`)
          .then((resp) => {
            return {
              balance_after: resp.data.results[0]?.balance_after ?? null,
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
    getYearTransactions()
  }, [allTargets]);



  return (
    <>
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row space-y-0 ">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Monthly Balance</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Balance on the end of each month per connected account</CardDescription>
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