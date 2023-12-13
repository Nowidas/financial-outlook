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


export const ChartBalancePerMonth = (data) => {
  if (data.data.length === 0) {
    return null;
  }
  return (
    <>
      <Card className="w-[800px]">
        <CardHeader className="flex flex-row space-y-0 ">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Net Income</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Sum of all transaction for given account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data.data}
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