import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axiosSesion from "@/components/helpers/sesioninterceptor";
import useCrud from "@/components/hooks/useCrud"
import { Modal } from "../ui/modal";
import { useAgreementsModal } from "../hooks/use-aggrements-modal";
import toast from "react-hot-toast";
import { Skeleton } from "../ui/skeleton";
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Trash2,
  Pencil,
  RefreshCcw,
  Calendar,
  ArrowBigLeftIcon,
  ArrowBigRightIcon,
  ArrowRightIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import AccountNameSwitcher from "@/components/account-name-switcher"
import AccountDeleteButton from "../account-delete-button";
import { Separator } from "./separator";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ConnectionsRunFetchButton from "../connections-runFetch-button";

export function ConnectionScrollList({
  className,
  ...props
}): React.HTMLAttributes<HTMLElement> {
  const navigate = useNavigate();

  const onOpen = useAgreementsModal((state) => state.onOpen);
  const isOpen = useAgreementsModal((state) => state.isOpen);

  const crudData = useCrud([], 'agreements')
  const { dataCRUD, error, isLoading, fetchData } = crudData;

  const CategoryData = useCrud([], 'category')


  const fetchAll = () => {
    fetchData();
    CategoryData.fetchData();
  }

  useEffect(() => {
    if (CategoryData.isLoading) {
      return;
    }
    const fetchDataAndHandleErrors = async () => {
      try {
        await CategoryData.fetchData();
      } catch (error) {
        console.error("Error fetching data: CategoryData");
        toast.error('Error fetching categories')
      }
    };
    fetchDataAndHandleErrors();
  }, []);

  async function fetchLastTask() {
    // Fetch data from your API here.
    try {
      const res = await axiosSesion.get('http://127.0.0.1:8000/tasks/last')
      const data = res.data.results[0]
      const formatted_data = format(new Date(data.date_done), 'dd MMM yyyy')
      return { formatted_data, ...data }
    } catch (err) {
      toast.error("Error fetching fetching last task")
    }
    return {}
  }

  const dataQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchLastTask(),
    staleTime: 5000,
    placeholderData: keepPreviousData
  })

  useEffect(() => {
    if (isOpen) {
      return;
    }
    if (isLoading) {
      return;
    }
    const fetchDataAndHandleErrors = async () => {
      try {
        await fetchData()
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error('Error fetching connections')
      }
    };

    fetchDataAndHandleErrors();

  }, [isOpen]);

  return (
    <Card className="w-auto">
      <CardHeader className="flex flex-row space-y-0">
        <div className="w-full">
          <CardTitle className="text-3xl font-bold tracking-tight">Connections</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">Created connections for fetching data</CardDescription>
        </div>
        <Button disabled={isLoading} onClick={fetchData} variant="outline" className="p-1 w-10 h-10"><RefreshCcw /></Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2 m-4">
          <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Category</TableHead>
                <TableHead className="w-[200px]">ID</TableHead>
                <TableHead className="w-[200px]">expires_at</TableHead>
                <TableHead >   </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isLoading ? dataCRUD?.results?.map((el) => (
                <TableRow key={el.agreement_id} className={cn(
                  "w-[200px]",
                  el.status != "LN"
                    ? "text-muted-foreground"
                    : null,
                  className
                )}>
                  <TableCell>
                    <AccountNameSwitcher cur_item={el} items={CategoryData.dataCRUD.results} fetchData={fetchAll} />

                  </TableCell>
                  <TableCell className="font-medium">{el.institution_id}:{el.agreement_id}</TableCell>
                  <TableCell>{el.expires_at}</TableCell>
                  <TableCell>
                    <div className="flex flex-row space-x-2">
                      <AccountDeleteButton cur_item={el} isLoading={isLoading} fetchData={fetchData} />

                    </div>
                  </TableCell>
                </TableRow>
              )) :
                [1, 2, 3, 4, 5].map((el) => (
                  <TableRow key={el} className="w-[200px]">
                    <TableCell className="font-medium"><Skeleton className="h-6 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                    <TableCell>
                      <div className="flex flex-row space-x-2">
                        <Button disabled={true} variant="outline" size="icon" className="w-full" onClick={() => { console.log('Click Edit') }}> <Pencil className="h-4 w-4" /> </Button>
                        <Button disabled={true} variant="outline" size="icon" className="w-full" onClick={() => { console.log('Click Delete') }}> <Trash2 className="h-4 w-4" /> </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
          {dataCRUD?.length == 0 ?
            <div className="flex flex-row justify-center w-full text-sm	p-4">No results.</div>
            : null}
          <Button variant="outline" className="w-full" disabled={isLoading} onClick={onOpen}>Add new connection</Button>
        </div>
        <Separator />
        <div className="flex flex-row m-4 ">
          <div className="flex grow space-x-1 items-center text-sm text-muted-foreground">
            <Calendar /> <div>Last fetching date: {dataQuery?.data?.formatted_data ?? "Loading.."} </div>
          </div>
          <div className="">
            <ConnectionsRunFetchButton />
          </div>
        </div>
      </CardContent>

    </Card>
  )
}