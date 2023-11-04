import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Transactions = {
    id: string
    amount: number
    description: string
    value_date: string
}

export const columns: ColumnDef<Transactions>[] = [
    {
        accessorKey: "value_date",
        header: "Value date",
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
]