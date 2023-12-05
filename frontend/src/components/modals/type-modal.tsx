import axios, { all } from "axios";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import SVG from 'react-inlinesvg';

import axiosSesion from "@/components/helpers/sesioninterceptor";
import { useQueryClient } from "@tanstack/react-query";


export const TypeModal = () => {
  const TypeModal = useTypeModal();
  const queryClient = useQueryClient()
  const [allIcon, setAllIcon] = useState([]);

  useEffect(() => {
    const fetchAllIcon = async () => {
      try {
        const response = await axiosSesion.get('http://127.0.0.1:8000/claudinary/');
        console.log(response);
        setAllIcon(response.data.data); // Assuming the icons are available in the response data
      } catch (error) {
        console.error("Error fetching icons", error);
        setAllIcon([]);
      }
    };
    fetchAllIcon();
  }, []);

  const formSchema = z.object({
    type: z.string().min(1).max(50),
    icon_url: z.enum(allIcon, {
      required_error: "You need to select a category icon.",
    }),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      // icon_url: "http://res.cloudinary.com/dr8gvbzra/image/upload/v1701782821/category-icons/oeqdvmudcgb9gcsz9aji.svg"

    }
  })

  useEffect(() => {
    if (!TypeModal.isOpen) {
      return
    }
    console.warn(TypeModal);
    form.setValue("type", TypeModal.typeId.type ?? "");
    form.setValue("icon_url", TypeModal.typeId.icon_url ?? "");
    form.register("icon_url");
  }, [TypeModal.isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!TypeModal.typeId.id) {
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
        const resp = await axiosSesion.put(TypeModal.typeId.id, values)
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
  if (allIcon === undefined) {
    return <div> Loading... </div>;
  }

  return (
    <Modal
      title={TypeModal.typeId.id ? `Edit a ${TypeModal.typeId.type} category` : "Create a new category"}
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
            <FormField
              control={form.control}
              name="icon_url"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-y-1"
                    >
                      {allIcon.map((icon) => (
                        <FormItem key={icon} className="flex items-center flex-wrap space-x-3 space-y-0">
                          <FormControl>
                            <div
                              onClick={() => field.onChange(icon)}
                              className={`cursor-pointer p-1 rounded-full ${field.value === icon
                                ? "border-2 border-primary"
                                : ""
                                }`}
                            >
                              <SVG
                                src={icon}
                                className="h-4 w-4"
                                height={16}
                                width={16}
                                title="React"
                                fill="hsl(var(--primary))"
                                cacheRequests={true}
                                preProcessor={(code) =>
                                  code.replace(/fill=".*?"/g, 'fill="hsl(var(--primary))"')
                                }
                              />
                            </div>
                          </FormControl>
                          {/* <FormLabel className="font-normal">
                            <SVG
                              src={icon}
                              className="h-4 w-4 p-[2px] bg-gradient-to-r from-cyan-500 to-blue-500	rounded-full"
                              height={16}
                              width={16}
                              title="React"
                              cacheRequests={true}
                              preProcessor={(code) => code.replace(/fill=".*?"/g, 'fill="hsl(var(--primary))"')}
                            />
                          </FormLabel> */}
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
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