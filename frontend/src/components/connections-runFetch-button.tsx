
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

import { ArrowRightIcon, Trash2 } from "lucide-react"
import { ReloadIcon } from "@radix-ui/react-icons"

import axiosSesion from "./helpers/sesioninterceptor"
import toast from "react-hot-toast"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"




export default function ConnectionsRunFetchButton({

}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [startingDate, setStartingDate] = useState(new Date())

  async function fetchLastTask() {
    // Fetch data from your API here.
    console.log('Repeated task ongoing')
    try {
      const res = await axiosSesion.get('http://127.0.0.1:8000/tasks/last')
      const data = res.data.results[0]
      return data
    } catch (err) {
      toast.error("Error fetching fetching last task")
    }
    return {}
  }

  const { data, isFetching } = useQuery({
    queryKey: ['tasks_refetching'],
    queryFn: () => fetchLastTask(),
    refetchInterval: 1000,
    enabled: enabled,
  })

  useEffect(() => {
    if (!enabled || isFetching) {
      return;
    }
    const fetching_satus = data.status
    const fetching_date = new Date(data.date_done)
    if (fetching_date > startingDate && fetching_satus === "Done") {
      console.log('Task finished')
      setEnabled(false)
      setDeleteOpen(false)
    }
  }, [data, enabled])

  const forceFetchingTransactions = async () => {
    setEnabled(true)
    setStartingDate(new Date())
    axiosSesion.post('http://127.0.0.1:8000/task/start/')
      .then((resp) => {
      })
  }

  return (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='ghost' disabled={false} > Force fetching for all connections<ArrowRightIcon /> </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>You want to continue?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is very costly and will take a while.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={enabled}>Cancel</AlertDialogCancel>
          {!enabled ? <Button variant='destructive' onClick={() => { forceFetchingTransactions() }}>Continue</Button> : <Button disabled>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Continue
          </Button>

          }
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  );
}

