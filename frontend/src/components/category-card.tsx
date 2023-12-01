import { useMemo, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { PaginationState } from "@tanstack/react-table"
import toast from "react-hot-toast"
import axiosSesion from "./helpers/sesioninterceptor"
import { ChevronsUpDown, CuboidIcon, EditIcon, PlusSquareIcon } from "lucide-react"
import { Button } from "./ui/button"

export const CategoryCard = () => {
  const [isOpen, setIsOpen] = useState(false)

  async function fetchTypes(page = 0) {
    // Fetch data from your API here.
    console.warn("fetching types")
    try {
      const res = await axiosSesion.get('http://127.0.0.1:8000/type/?page=' + (page + 1))
      const data = res.data.results
      const count = res.data.count
      console.warn(data)
      const formatted_result = data.map((data) => {
        return {
          "id": data.url,
          "type": data.type,
          "rules": data.rules
        }
      })
      return {
        'count': count,
        'rows': [...formatted_result]
      }
    } catch {
      console.warn("Error fetching categories")
      toast.error("Error fetching categories")
    }
    return {
      'count': 1,
      'rows': []
    }
  }

  const [{ pageIndex, pageSize }, setPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10
    })

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const dataQuery = useQuery({
    queryKey: ['types', 1],
    queryFn: () => fetchTypes(pageIndex),
    staleTime: 5000,
    placeholderData: keepPreviousData
  })

  if (dataQuery.isLoading) {
    return <span>Loading...</span>
  }

  if (dataQuery.isError) {
    return <span>Error</span>
  }
  console.warn(dataQuery.data)
  return (
    <>
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row space-y-0">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Types and rules</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Manage category types for each transactions and rules to assign them</CardDescription>
          </div>
          <Button disabled={false} onClick={() => console.log('click')} variant="ghost" className="p-1 w-10 h-10"><PlusSquareIcon /></Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 m-4">
            {dataQuery.data.rows.map((type) => (
              <Alert key={type.id}>
                <CuboidIcon className="h-4 w-4" />
                <AlertTitle>{type.type}</AlertTitle>
                <AlertDescription>
                  <Collapsible

                    className="w-[350px] space-y-2"
                  >
                    <div className="flex items-center justify-between space-x-4 ">
                      <h4 className={"text-sm font-semibold " + (!type.rules.length ? 'text-muted-foreground' : '')}>
                        {type.rules.length} rules to show.
                      </h4>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0" disabled={!type.rules.length}>
                          <ChevronsUpDown className="h-4 w-4" />
                          <span className="sr-only">Toggle</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    {/* <div className="rounded-md border px-4 py-3 font-mono text-sm">
                      @radix-ui/primitives
                    </div> */}
                    <CollapsibleContent className="space-y-2">
                      {type.rules.map((rule) => (
                        <div key={rule.url} className="flex items-center justify-between space-x-4 rounded-md border px-3 py-1 font-mono text-sm">
                          <h4 className="text-sm font-normal">
                            {rule.rule}
                          </h4>
                          <Button variant="ghost" size="sm" className="w-9 p-0">
                            <EditIcon className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </div>
                      ))}

                    </CollapsibleContent>
                  </Collapsible>
                </AlertDescription>
              </Alert>
            ))}
          </div>

        </CardContent>

      </Card>
    </>
  )
}