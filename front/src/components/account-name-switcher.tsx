import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDownIcon, PlusCircleIcon } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./ui/command"
import axiosSesion from "./helpers/sesioninterceptor"
import toast from "react-hot-toast"

import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface StoreSwitchProps extends PopoverTriggerProps {
  cur_item: {
    category: {
      url: string
      custom_name: string
    } | undefined
  },
  items:
  [{
    url: string
    custom_name: string
  }
  ],
  fetchData: Promise<void>
}

const formSchema = z.object({
  custom_name: z.string().min(1),
  url_hidden: z.string().min(1)
})

export default function AccountNameSwitcher({
  className,
  cur_item,
  items,
  fetchData

}: StoreSwitchProps) {


  const postEdit = async (el, cur_item, fetchData) => {
    // setDeleteLoading(true);
    axiosSesion
      .put(cur_item.url, { 'custom_name': el.custom_name })
      .then(() => {
        // setDeleteLoading(false); setDeleteOpen(false);
        console.log(`Edited: ${cur_item.category?.custom_name} to ${el.custom_name}`);
        fetchData()
      })
      .catch(() => { toast.error("Unable to update"); fetchData() })
  }
  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [open, setOpen] = useState(false)
  const onNameSelect = async (el, cur_item, fetchData) => {
    postEdit(el, cur_item, fetchData)
    setOpen(false)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      custom_name: null,
    }
  })
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    axiosSesion
      .put(values.url_hidden, { 'custom_name': values.custom_name })
      .then(() => {
        // setDeleteLoading(false); setDeleteOpen(false);
        console.log(`Added new and set: ${values.custom_name}`);
      })
      .catch(() => { toast.error("Unable to update"); })
      .finally(() => { setShowNewTeamDialog(false); fetchData() })
  }
  const onClose = async () => {
    form.reset();
    setShowNewTeamDialog(false)
  }

  return (
    <Dialog open={showNewTeamDialog} onOpenChange={onClose} >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" role="combobox" aria-expanded={open} aria-label="Select name for account" className={cn("w-[200px] justify-between", className)}>

            {cur_item.category?.custom_name}
            <ChevronsUpDownIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command >
            <CommandList>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>Name not found</CommandEmpty>
              <CommandGroup heading="Names">
                {items?.map((item) => (
                  <CommandItem
                    key={item.url}
                    onSelect={() => onNameSelect(item, cur_item, fetchData)}
                    className="text-sm"
                  >
                    {item.custom_name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        item.url === cur_item.category?.url
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild >
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewTeamDialog(true)
                    }}
                  >
                    <PlusCircleIcon className="mr-2 h-5 w-5" />
                    Create Team
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Add a new team to manage products and customers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="custom_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={false} placeholder="Name for account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              defaultValue={cur_item.url}
              name="url_hidden"
              render={({ field }) => {
                console.log("loaded as needed")
                return (
                  <FormItem>
                    <FormControl>
                      <Input type="hidden"  {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            <div className="mt-6">
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewTeamDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" >Continue</Button>
            </DialogFooter>
          </form>
        </Form>
        {/* <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input id="name" placeholder="Acme Inc." />
            </div>
          </div>
        </div> */}
      </DialogContent>
    </Dialog >
  );
}

