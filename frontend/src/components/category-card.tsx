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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PaginationState } from "@tanstack/react-table"
import toast from "react-hot-toast"
import axiosSesion from "./helpers/sesioninterceptor"
import { AppleIcon, BoxIcon, ChevronsUpDown, CuboidIcon, EditIcon, Pencil, PlusIcon, PlusSquareIcon, Trash2 } from "lucide-react"
import { Button } from "./ui/button"
import { useTypeModal } from "./hooks/use-type-modal"
import { useTypeRuleModal } from "./hooks/use-typerule-modal"

import SVG from 'react-inlinesvg';

export const CategoryCard = () => {
  const onOpenType = useTypeModal((state) => state.onOpen);
  const onOpenTypeRule = useTypeRuleModal((state) => state.onOpen);

  async function fetchTypes(page = 0) {
    // Fetch data from your API here.
    try {
      const res = await axiosSesion.get('http://127.0.0.1:8000/type/?page=' + (page + 1))
      const data = res.data.results
      const count = res.data.count
      const formatted_result = data.map((data) => {
        return {
          "id": data.url,
          "type": data.type,
          "icon_url": data.icon_url,
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

  const typeDelete = async (urlId: string) => {
    try {
      const resp = await axiosSesion.delete(urlId)
      toast.success("Category deleted.");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      dataQuery.refetch()
    }

  }

  const typeruleDelete = async (urlId: string) => {
    try {
      const resp = await axiosSesion.delete(urlId)
      toast.success("Category deleted.");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      dataQuery.refetch()
    }

  }

  if (dataQuery.isLoading) {
    return <span>Loading...</span>
  }

  if (dataQuery.isError) {
    return <span>Error</span>
  }
  // console.warn(dataQuery.data)
  return (
    <>
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row space-y-0">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Types and rules</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Manage category types for each transactions and rules to assign them</CardDescription>
          </div>
          <Button disabled={false} onClick={() => onOpenType({})} variant="ghost" className="p-1 w-10 h-10"><PlusSquareIcon /></Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 m-4">
            {dataQuery.data.rows.map((type) => (
              <Alert key={type.id}>
                {type.icon_url ? (

                  <SVG
                    src={type.icon_url}
                    className="h-4 w-4 p-[2px]"
                    fill="hsl(var(--primary))"
                    height={16}
                    width={16}
                    title="React"
                    cacheRequests={true}
                    preProcessor={(code) => code.replace(/fill=".*?"/g, 'fill="hsl(var(--primary))"')}
                  />
                  // <img className="h-4 w-4" src={type.icon_url} />
                ) : (

                  // <div className="h-4 w-4" >
                  //   🥞
                  // </div>
                  <BoxIcon className="h-4 w-4 p-[2px] " />
                )}

                <AlertTitle>{type.type}</AlertTitle>
                <AlertDescription className="flex flex-row w-full">
                  <Collapsible
                    className="w-[550px] space-y-2"
                  >
                    <div className="flex items-center justify-between space-x-4 ">
                      <h4 className={"text-sm font-semibold " + (!type.rules.length ? 'text-muted-foreground' : '')}>
                        {type.rules.length} rules to show.
                      </h4>
                      {type.rules.length ?
                        (
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0" >
                              <ChevronsUpDown className="h-4 w-4" />
                              <span className="sr-only">Toggle</span>
                            </Button>
                          </CollapsibleTrigger>
                        ) : (
                          <Button variant="ghost" size="sm" className="w-9 p-0" onClick={() => onOpenTypeRule(type.type)}>
                            <PlusIcon className="h-4 w-4" />
                            <span className="sr-only">Add new rule</span>
                          </Button>
                        )
                      }
                    </div>
                    <CollapsibleContent className="space-y-2">
                      {type.rules.map((rule) => (
                        <div key={rule.url} className="flex items-center justify-between space-x-4 rounded-md border px-3 py-1 font-mono text-sm">
                          <h4 className="text-sm font-normal">
                            {rule.rule}
                          </h4>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-9 p-0" >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                              {/* <Button disabled={false} variant="ghost" className="p-1 w-9 h-9"><Trash2 /></Button> */}
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>

                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <Button variant='destructive' onClick={() => typeruleDelete(rule.url)}> Delete </Button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                        </div>
                      ))}
                      <Button variant="outline" className="w-full flex items-center justify-start space-x-2 rounded-md border px-3 py-1 font-mono text-sm" onClick={() => onOpenTypeRule(type.type)}>
                        <h4 className="text-sm font-normal cursor-pointer">
                          New rule
                        </h4>
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </CollapsibleContent>

                  </Collapsible>
                  <div className="flex flex-row space-x-2 w-full justify-end">
                    <Button disabled={false} onClick={() => onOpenType(type)} variant="ghost" className="p-1 w-9 h-9"><Pencil /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button disabled={false} variant="ghost" className="p-1 w-9 h-9"><Trash2 /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>

                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button variant='destructive' onClick={() => typeDelete(type.id)}> Delete </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {/* <AlertDialog >
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="p-1 w-9 h-9" > <Trash2 /> </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel >Cancel</AlertDialogCancel>
                          <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => typeDelete(type.id)}>Delete</Button>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog> */}
                  </div>

                </AlertDescription>
              </Alert>
            ))}
          </div>

        </CardContent>

      </Card >
    </>
  )
}