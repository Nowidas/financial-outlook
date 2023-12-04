import axios from "axios";
import React, { useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { useTypeRuleModal as useTypeRuleModal } from "../hooks/use-typerule-modal";
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
  rule: z.string().min(1).max(50),
  type: z.object({
    type: z.string().min(1).max(50)
  }),
});

export const TypeRuleModal = () => {
  const TypeRuleModal = useTypeRuleModal();
  const queryClient = useQueryClient();


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rule: "",
    },
  });

  useEffect(() => {
    if (!TypeRuleModal.isOpen) return;
    form.register("type.type", { value: TypeRuleModal.ruleId });
  }, [TypeRuleModal]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // console.error(values);
    try {
      const resp = await axiosSesion.post('http://127.0.0.1:8000/typerule/', values);
      toast.success("Rule added.");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      TypeRuleModal.onClose();
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['types'], type: 'active' });
    }
  };

  const onClose = () => {
    TypeRuleModal.onClose();
    form.reset();
  };

  return (
    <Modal
      title="Create a new rule for this category"
      isOpen={TypeRuleModal.isOpen}
      onClose={onClose}
    >
      <div className="flex flex-wrap w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="rule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regex for category</FormLabel>
                  <FormControl>
                    <Input placeholder="Walmart" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
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
};