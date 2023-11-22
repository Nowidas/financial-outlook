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
import { FilterIcon, RefreshCcw } from "lucide-react"
import { ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis, Bar, BarChart, Line, ComposedChart } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Checkbox } from "./ui/checkbox"


export const ChartInOutcomesCard = () => {
  const [data, setData] = useState([])
  const [dateStart, setDateStart] = useState(new Date(new Date().getFullYear(), 0, 1))
  const [dateEnd, setDateEnd] = useState(new Date(new Date().getFullYear(), 11, 31))
  const [allTargets, setAllTargets] = useState([])

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
    const targetsString = allTargets.filter((val) => val.is_checked).map((val) => val.name).join(',');

    try {
      const response = await axiosSesion.get(`http://127.0.0.1:8000/transactions/sum/?value_date_after=${format(dateStart, 'yyyy-MM-dd')}&value_date_before=${format(dateEnd, 'yyyy-MM-dd')}&category=${targetsString}`);
      const aggregatedData = response.data;

      const transformedArray = aggregatedData.reduce((acc, res) => {
        const month = res.month;
        const amount = parseFloat(res.sum_amount) || 0;

        const existingMonth = acc.find(item => item.month === month);

        if (!existingMonth) {
          acc.push({
            month,
            [`expenses`]: amount < 0 ? Math.abs(amount) : 0,
            [`incomes`]: amount >= 0 ? amount : 0,
            [`net`]: amount,
          });
        } else {
          existingMonth[`net`] = (existingMonth[`net`] || 0) + amount;
          if (amount < 0) {
            existingMonth[`expenses`] = (existingMonth[`expenses`] || 0) + Math.abs(amount);
          } else {
            existingMonth[`incomes`] = (existingMonth[`incomes`] || 0) + amount;
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="p-1 w-10 h-10">< FilterIcon /></Button>
              </PopoverTrigger>
              <PopoverContent>
                {allTargets.map((val) => (
                  <div key={val.name} className="flex flex-row w-full items-center space-x-2 font-semibold">
                    <Checkbox id={val.name} checked={val.is_checked} onCheckedChange={(checked) => {
                      return setAllTargets(allTargets.map((el) => (el.name === val.name ? { name: el.name, is_checked: checked } : el)))
                    }} />
                    <label id={val.name} htmlFor={val.name}>{val.name}</label>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
            {/* <Button disabled={!data.length} onClick={getBalances} variant="outline" className="p-1 w-10 h-10"><RefreshCcw /></Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                stackOffset="sign"
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="10 10" opacity={0.4} />

                <XAxis dataKey="month" opacity={0} tick={({ payload, x, y, index }) => (
                  <text x={x} y={y - 10} dy={16} fill="#666" textAnchor="middle">
                    {payload.value}
                  </text>
                )} />
                <YAxis interval={'preserveEnd'} tickCount={20} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((el, idx) => (
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
                {['incomes', 'expenses'].map((val, idx) => {
                  return (
                    <Bar
                      key={`${val}`}
                      dataKey={`${val}`}
                      fill={val === 'expenses' ? 'var(--negative)' : 'var(--positive)'}
                    />
                  )
                })}

                <Line
                  key={`net`}
                  dataKey={`net`}
                  fill={'hsl(var(--primary))'}
                  stroke={'hsl(var(--primary))'}
                  type="monotone"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card >
    </>
  )
}