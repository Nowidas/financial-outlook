import axios from "axios";
import React, { useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { useTypeModal as useTypeModal } from "../hooks/use-type-modal";
import { Button } from "../ui/button";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { toast } from 'react-hot-toast';

import axiosSesion from "@/components/helpers/sesioninterceptor";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  type: z.string().min(1).max(50),
})

export const TypeModal = () => {
  const TypeModal = useTypeModal();
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!TypeModal.isOpen) {
      return
    }
    console.log(TypeModal.typeId);
  }, [TypeModal.isOpen]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",

    }
  })
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (TypeModal.typeId === '') {
      // Create the POST requuest
      try {
        const resp = await axiosSesion.post('http://127.0.0.1:8000/type/', values)
        toast.success("Category created.");
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        TypeModal.onClose();
        form.reset();
        queryClient.invalidateQueries({ queryKey: ['types'], type: 'active', })
      }
    } else {
      // Create the PUT request
      try {
        const resp = await axiosSesion.put(TypeModal.typeId, values)
        toast.success("Category updated.");
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        TypeModal.onClose();
        form.reset();
        queryClient.invalidateQueries({ queryKey: ['types'], type: 'active', })
      }

    }
  }
  const onClose = async () => {
    TypeModal.onClose();
    form.reset();
  }

  return (
    <Modal
      title={TypeModal.typeId ? "Edit category" : "Create a new category"}
      isOpen={TypeModal.isOpen}
      onClose={onClose}
    >
      <div className="flex flex-wrap w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name of category</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries" {...field} />
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