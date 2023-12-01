import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "./ui/button"
import { useMemo, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import axiosSesion from "./helpers/sesioninterceptor"
import toast from "react-hot-toast"

// interface DataTableProps<TData, TValue> {
//   columns: ColumnDef<TData, TValue>[]
// }


export function DataTable({
  columns,
}) {


  async function fetchTransactions(page = 0) {
    // Fetch data from your API here.
    try {
      const res = await axiosSesion.get('http://127.0.0.1:8000/transactions/?page=' + (page + 1))
      const data = res.data.results
      const count = res.data.count
      const formatted_result = data.map((data) => {
        return {
          "id": data.url,
          "amount": data.amount,
          "description": data.description,
          "value_date": data.value_date,
          "category": data.account.agreements.category.custom_name,
          "type": data.type.type
        }
      })
      return {
        'count': count,
        'rows': [...formatted_result]
      }
    } catch {
      toast.error("Error fetching transpactions")
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
    queryKey: ['transactions', pageIndex],
    queryFn: () => fetchTransactions(pageIndex),
    staleTime: 5000,
    placeholderData: keepPreviousData
  })

  const defaultData = useMemo(() => [], [])

  const table = useReactTable({
    data: dataQuery.data?.rows ?? defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: Math.ceil(dataQuery.data?.count / 10),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    manualPagination: true,
    debugTable: true,
  })


  return (
    <>
      <div className="rounded-md border w-full">
        <Table >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="h-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-6 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </>
  )
}
