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
import { ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts"


export const ChartInOutcomesCard = () => {
  const [allTargets, setAllTargets] = useState([])
  const [data, setData] = useState([])

  const initTarget = () => {
    return axiosSesion
      .get('http://127.0.0.1:8000/category')
      .then((resp) => {
        setAllTargets(resp.data.results.map((val) => ({ name: val.custom_name, is_checked: true })));
      })
  }

  const getYearIncomeOutcome = async () => {
    if (allTargets.length === 0) {
      return;
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

      console.warn(allTransactions);
      const transformedArray = allTransactions.reduce((acc, entry) => {
        const month = new Date(entry.value_date).getMonth();
        const amount = parseFloat(entry.amount) || 0; // Parse amount as a float or default to 0
        const category = entry.account.agreements.category.custom_name;

        const existingMonth = acc.find(item => item.month === month);

        if (!existingMonth) {
          acc.push({
            month,
            [`${category}_expenses`]: amount < 0 ? amount : 0,
            [`${category}_incomes`]: amount >= 0 ? amount : 0,
          });
        } else {
          if (amount < 0) {
            existingMonth[`${category}_expenses`] = (existingMonth[`${category}_expenses`] || 0) + amount;
          } else {
            existingMonth[`${category}_incomes`] = (existingMonth[`${category}_incomes`] || 0) + amount;
          }
        }

        return acc;
      }, []);

      // Process or use allTransactions here
      console.warn(transformedArray);
      setData(transformedArray);
    } catch (error) {
      // Handle errors
      console.error("Error fetching transactions:", error);
    }
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
            <CardTitle className="text-3xl font-bold tracking-tight">Net Income</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Sum of all transaction for given account</CardDescription>
          </div>
          <div className="flex flex-row space-x-1">
            <Button disabled={!data.length} variant="outline" className="p-1 w-10 h-10"><RefreshCcw /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.reverse()}
                stackOffset="sign"
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" opacity={0} tick={({ payload, x, y, index }) => (
                  <text x={x} y={y - 10} dy={16} fill="#666" textAnchor="middle">
                    {payload.value}
                  </text>
                )} />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            {allTargets.concat(allTargets).map((el, idx) => (
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
                {allTargets.map((target, idx) => ['incomes', 'expenses'].map((val, idx) => {
                  return (
                    <Bar
                      key={`${target.name}_${val}`}
                      dataKey={`${target.name}_${val}`}
                      stackId={`${target.name}`}
                      fill={val === 'expenses' ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                    />
                  )
                }))}

              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card >
    </>
  )
}