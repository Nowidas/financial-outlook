import axios, { all } from "axios";
import React, { useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { useTransactionNote as useTransactionNote } from "../hooks/use-transation-note-modal";
import { Button } from "../ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea"
import { toast } from 'react-hot-toast';

import axiosSesion from "@/components/helpers/sesioninterceptor";
import { useQueryClient } from "@tanstack/react-query";


export const TransactionNote = () => {
  const TransactionNote = useTransactionNote();
  const queryClient = useQueryClient()

  const formSchema = z.object({
    note: z.string().min(0).max(500),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      note: "",
    }
  })

  useEffect(() => {
    if (!TransactionNote.isOpen) {
      return
    }
    form.setValue("note", TransactionNote.transaction.note ?? "");
    console.log(TransactionNote.transaction.note)
  }, [TransactionNote.isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const resp = await axiosSesion.patch(TransactionNote.transaction.id, values)
      toast.success("Transaction edited with note.");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      queryClient.invalidateQueries({ queryKey: ['transactions'], type: 'active', })
      TransactionNote.onClose();
      form.reset();
    }
  }

  const onClose = async () => {
    TransactionNote.onClose();
    form.reset();
  }


  return (
    <Modal
      title={`Note for transaction`}
      isOpen={TransactionNote.isOpen}
      onClose={onClose}
    >
      <div className="flex flex-wrap w-full">
        <Form  {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem >
                  <FormLabel>Note text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="bla bla bla"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </Modal>
  );
}