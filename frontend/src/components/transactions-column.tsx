import { ColumnDef } from "@tanstack/react-table"
import SVG from 'react-inlinesvg';
import { Button } from "./ui/button";
import { BotIcon, BoxIcon, MoreHorizontal, StickyNoteIcon } from "lucide-react";
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
import { Checkbox } from "./ui/checkbox";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosSesion from "./helpers/sesioninterceptor";
import toast from "react-hot-toast";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Transactions = {
    id: string
    amount: number
    description: string
    value_date: string
    category: string
    type: {
        icon_url: string | undefined;
        type: string;
    },
    type_manual: {
        icon_url: string | undefined;
        type: string;
    } | undefined
}

export const columns: ColumnDef<Transactions>[] = [
    {
        accessorKey: "value_date",
        header: "Value date",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const transaction = row.original
            const type = transaction.type_manual ? transaction.type_manual : transaction.type
            const manualFlag = transaction.type_manual ? true : false
            return type?.icon_url ? (
                <div className={`flex flex-row space-x-2 items-center ${manualFlag ? 'italic' : ''}`}>
                    <SVG
                        className="h-4 w-4"
                        height={16}
                        width={16}
                        title={type.type}
                        fill="hsl(var(--primary))"
                        src={type.icon_url} />
                    <span>{type.type}</span>
                </div>
            ) : (
                <div className={`flex flex-row space-x-2 items-center ${manualFlag ? 'bg-red-700' : ''}`}>
                    <span>{type.type}</span>
                </div>
            )
        }
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
    {
        id: "actions",
        cell: ({ row }) => {
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
                }
                return {
                    'count': 1,
                    'rows': []
                }
            }
            const queryClient = useQueryClient()

            const dataQuery = useQuery({
                queryKey: ['types', 1],
                queryFn: () => fetchTypes(0),
                staleTime: 5000,
                placeholderData: keepPreviousData
            })
            const putType = async (transaction, type) => {
                // setDeleteLoading(true);
                console.warn('[PUT]', transaction.id, { 'type_manual': type.type === transaction.type.type ? null : type.id })
                axiosSesion
                    .patch(transaction.id, { 'type_manual': type.type === transaction.type.type ? null : type.id })
                    .then(() => {
                        queryClient.invalidateQueries({ queryKey: ['transactions'], type: 'active', })
                    })
                    .catch(() => { toast.error("Unable to update"); })
            }
            const changeType = async (transaction, type) => {
                putType(transaction, type)
            }

            const transaction = row.original
            const transactionType = transaction.type_manual ? transaction.type_manual : transaction.type
            const manualFlag = transaction.type_manual ? true : false
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <BoxIcon className="mr-2 h-4 w-4" />
                                <span>Change category</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {dataQuery.data?.rows.map((type) =>
                                    (
                                        <DropdownMenuCheckboxItem checked={transactionType.type === type.type} key={type.id} onClick={() => { changeType(transaction, type) }}>
                                            <label htmlFor={type.id} >
                                                {type.type}
                                            </label>
                                            {manualFlag && transaction.type.type === type.type ? (<BotIcon className="ml-1 h-4 w-4" />) : null}
                                        </DropdownMenuCheckboxItem>
                                    )
                                    )}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => console.log(`Clicked disable for ${transaction.id}`)} >
                            <Checkbox id={transaction.id} className="mr-2 h-4 w-4" />
                            <label htmlFor={transaction.id} >
                                Disable transaction
                            </label>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <StickyNoteIcon className="mr-2 h-4 w-4" />
                            <span>Add note</span> </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    },
]