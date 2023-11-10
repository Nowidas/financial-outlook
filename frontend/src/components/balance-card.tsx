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


export const BalanceCard = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [allTargets, setAllTargets] = useState([])

  const getBalances = () => {
    setData([])
    if (allTargets.length == 0) {
      return
    }
    Promise.all(allTargets
      .filter((val) => val.is_checked)
      .map((val) => {
        return axiosSesion
          .get('http://127.0.0.1:8000/transactions/?category=' + val.name)
          .then((resp) => {
            return { data: resp.data.results }
          })
      })).then(resp => { setData(resp); })

  }

  const initTarget = () => {
    return axiosSesion
      .get('http://127.0.0.1:8000/category')
      .then((resp) => {
        setAllTargets(resp.data.results.map((val) => ({ name: val.custom_name, is_checked: true })));
      })
  }

  useEffect(() => {
    initTarget()
  }, [])

  useEffect(() => {
    getBalances()
  }, [allTargets]);


  return (
    <>
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row space-y-0 ">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Accounts Balance</CardTitle>
          </div>
          <div className="flex flex-row space-x-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="p-1 w-10 h-10">< FilterIcon /></Button>
              </PopoverTrigger>
              <PopoverContent>
                {allTargets.map((val) => (
                  <div className="flex flex-row w-full items-center space-x-2 font-semibold">
                    <Checkbox key={val.name} id={val.name} checked={val.is_checked} onCheckedChange={(checked) => {
                      return setAllTargets(allTargets.map((el) => (el.name === val.name ? { name: el.name, is_checked: checked } : el)))
                    }} />
                    <label id={val.name} htmlFor={val.name}>{val.name}</label>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
            <Button disabled={!data.length} onClick={getBalances} variant="outline" className="p-1 w-10 h-10"><RefreshCcw /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row basis-20 space-x-2 m-4 ">
            {data.length ? data.map((val) => (
              <div key={val.data[0].account.agreements.category.url} className="flex flex-col space-y-2 p-4 border rounded-md">
                <div className='w-full text-sm font-bold'>{val.data[0].account.agreements.category.custom_name}</div>
                <div className='flex flex-row w-full text-2xl font-bold items-center  '>
                  <DollarSign className='text-muted-foreground' />
                  <div>
                    {Intl.NumberFormat('pl-PL', {
                      style: 'currency', currency: val.data[0].currency,
                    }).format(val.data[0].balance_after)}
                  </div>
                </div>
              </div>
            )) :
              <div >
                "Loading"
              </div>
            }
          </div>
        </CardContent>
      </Card >
    </>
  )
}