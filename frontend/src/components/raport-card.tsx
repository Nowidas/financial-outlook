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
import { CalendarIcon, FilterIcon, RefreshCcw } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Checkbox } from "./ui/checkbox"
import { formatCurrency } from "../lib/utils.ts"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChartBalancePerMonth } from "./chart-balance-per-month.tsx"
import { ChartByCategory } from "./chart-expenses-by-category.tsx"

export const RaportCard = () => {
  const [data, setData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [categoryData2, setCategoryData2] = useState([])
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

      setData(transformedArray);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  const getCategoryBalance = async () => {
    if (allTargets.length === 0) {
      return;
    }
    const targetsString = allTargets.filter((val) => val.is_checked).map((val) => val.name).join(',');

    try {
      const response = await axiosSesion.get(`http://127.0.0.1:8000/transactions/category/?value_date_after=${format(dateStart, 'yyyy-MM-dd')}&value_date_before=${format(dateEnd, 'yyyy-MM-dd')}&category=${targetsString}`);
      const aggregatedData = response.data;

      // Transform the data
      const transformedArrayExpenses = aggregatedData.map(item => (item.sum_amount < 0 ? {
        name: item.type,
        size: Math.abs(item.sum_amount)
      } : null)).filter(item => item !== null);

      const transformedArrayIncomes = aggregatedData.map(item => (item.sum_amount > 0 ? {
        name: item.type,
        size: Math.abs(item.sum_amount)
      } : null)).filter(item => item !== null);

      setCategoryData(transformedArrayExpenses);
      setCategoryData2(transformedArrayIncomes);

    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }



  useEffect(() => {
    initTarget()
  }, [])

  useEffect(() => {
    getYearIncomeOutcome();
    getCategoryBalance();
  }, [allTargets]);



  return (
    <>
      <Card className="w-[800px]">
        <CardHeader className="flex flex-row space-y-0 ">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Statistics</CardTitle>
            {/* <CardDescription className="text-sm text-muted-foreground">Sum of all transaction for given account</CardDescription> */}
          </div>
          <div className="flex flex-row space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" >< CalendarIcon className="mr-2 w-6 h-6" />
                  <span className="text-sm font-semibold">2023</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Year</DropdownMenuLabel>
                {['2023', '2022'].map((dateRange) =>
                (
                  <DropdownMenuCheckboxItem checked={false} key={dateRange} onClick={() => console.log(dateRange)}>
                    <label htmlFor={dateRange} >
                      {dateRange}
                    </label>
                  </DropdownMenuCheckboxItem>
                )
                )}
                <DropdownMenuLabel>Month</DropdownMenuLabel>
                {['Jun', 'May'].map((dateRange) =>
                (
                  <DropdownMenuCheckboxItem checked={false} key={dateRange} onClick={() => console.log(dateRange)}>
                    <label htmlFor={dateRange} >
                      {dateRange}
                    </label>
                  </DropdownMenuCheckboxItem>
                )
                )}
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={false} key={'custom'} onClick={() => console.log('custom')}>
                  <label htmlFor={'custom'} >
                    custom
                  </label>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row space-x-5 ">
            <div className="p-2 flex flex-col space-y-2 rounded-md border-2 ">
              <span className="font-bold">Income</span>
              <span className="text-2xl font-bold text-green-800">+{formatCurrency(data.reduce((acc, val) => acc + val.incomes, 0).toFixed(0), 'PLN', 0)}</span>
              <span className="text-2xl font-bold text-green-800">+{formatCurrency(Math.round(data.reduce((acc, val) => acc + val.incomes, 0).toFixed(0) / 12), 'PLN', 0)}/m</span>
            </div>
            <div className="p-2 flex flex-col space-y-2 rounded-md border-2">
              <span className="font-bold">Expenses</span>
              <span className="text-2xl font-bold text-red-800">-{formatCurrency(Math.round(data.reduce((acc, val) => acc + val.expenses, 0).toFixed(0)), 'PLN', 0)}</span>
              <span className="text-2xl font-bold text-red-800">-{formatCurrency(Math.round(data.reduce((acc, val) => acc + val.expenses, 0).toFixed(0) / 12), 'PLN', 0)}/m</span>
            </div>
            <div className="p-2 flex flex-col space-y-2 rounded-md border-2">
              <span className="font-bold">Net</span>
              <span className="text-2xl font-bold ">{formatCurrency(Math.round(data.reduce((acc, val) => acc + val.net, 0).toFixed(0)), 'PLN', 0)}</span>
              <span className="text-2xl font-bold ">{formatCurrency(Math.round(data.reduce((acc, val) => acc + val.net, 0).toFixed(0) / 12), 'PLN', 0)}</span>
            </div>
            {/* <div className="flex flex-col space-y-2">
              <label htmlFor="dateStart">Date start</label>
              <input type="date" id="dateStart" value={format(dateStart, 'yyyy-MM-dd')} onChange={(e) => setDateStart(new Date(e.target.value))} />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="dateEnd">Date end</label>
              <input type="date" id="dateEnd" value={format(dateEnd, 'yyyy-MM-dd')} onChange={(e) => setDateEnd(new Date(e.target.value))} />
            </div> */}
          </div>
        </CardContent>
      </Card >
      <ChartBalancePerMonth data={data} />
      <ChartByCategory data={categoryData} title={'Expenses'} subtitle={'All expenses for given category'} color={'negative'} />
      <ChartByCategory data={categoryData2} title={'Incomes'} subtitle={'All incomes for given category'} color={'positive'} />
    </>
  )
}