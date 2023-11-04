import { toast } from "react-hot-toast"
import axiosSesion from "./helpers/sesioninterceptor"
import { Transactions, columns } from "./transactions-column"
import { DataTable } from "./transactions-data-table"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const TransactionsCard = () => {
  return (
    <>
      <Card className="w-[1000px]">
        <CardHeader className="flex flex-row space-y-0">
          <div className="w-full">
            <CardTitle className="text-3xl font-bold tracking-tight">Transactions</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">All fetched transactions from connected accounts</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 m-4">
            <DataTable columns={columns} />
          </div>

        </CardContent>

      </Card>
    </>
  )
}