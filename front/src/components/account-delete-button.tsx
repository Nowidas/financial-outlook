
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
import { useState } from "react"
import { Button } from "./ui/button"

import { Trash2 } from "lucide-react"
import { ReloadIcon } from "@radix-ui/react-icons"

import axiosSesion from "./helpers/sesioninterceptor"
import toast from "react-hot-toast"




export default function AccountDeleteButton({
  cur_item,
  isLoading,
  fetchData

}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showNewTeamDialog, setShowNewTeamDialog] = useState(false)
  const [open, setOpen] = useState(false)


  const postDelete = (url: string, fetchData) => {
    setDeleteLoading(true);
    console.log(url);
    axiosSesion
      .delete(url)
      .then(() => {
        setDeleteLoading(false); setDeleteOpen(false);
        console.log(`Deleted: ${url}`);
      })
      .catch(() => { toast.error("Something went wrong"); })
      .finally(fetchData)

  }

  return (
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="w-10" disabled={isLoading} > <Trash2 className="h-4 w-4" /> </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
          {!deleteLoading ? <Button onClick={() => postDelete(cur_item.url, fetchData)}>Continue</Button> : <Button disabled>
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            Deleting..
          </Button>}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

