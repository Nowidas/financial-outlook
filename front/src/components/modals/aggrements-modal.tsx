import axios from "axios";
import React, { useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { useAgreementsModal as useAgreementsModal } from "../hooks/use-aggrements-modal";
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
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { redirect } from "react-router-dom";

const formSchema = z.object({
  agreement_id: z.string().min(1),
  category: z.object({
    custom_name: z.string().min(1).nullable()
  })
})

export const AgreementsModal = () => {

  const agreementsModal = useAgreementsModal();
  const [apiData, setApiData] = useState([])
  const [apiAccessToken, setApiAccesToken] = useState("")
  const [apiRefreshToken, setApiRefreshToken] = useState("")

  useEffect(() => {
    if (!agreementsModal.isOpen) {
      return
    }
    console.log("api modal loading data")
    if (apiAccessToken === "") {
      axiosSesion
        .get("http://127.0.0.1:8000/gocardless/token")
        .then((res) => {
          const data = res.data.data
          console.log(data);
          setApiAccesToken(data.access)
          setApiRefreshToken(data.refresh)
          axios
            .get(
              "/api/v2/institutions/?country=pl",
              {
                headers:
                {
                  accept: "application/json",
                  Authorization: `Bearer ${data.access}`,
                  mode: "no-cors"
                }
              })
            .then((res) => {
              const data = res.data
              console.log(data)
              setApiData(data)
            })
            .catch((err) => {
              console.log(err)
            })
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [agreementsModal.isOpen]);


  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agreement_id: "",
      category: {
        custom_name: null
      }
    }
  })
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // Create the POST requuest
    try {
      setLoading(true);
      const resp = await axiosSesion.post('http://127.0.0.1:8000/agreements/', values)
      toast.success("Aggrement created.");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      agreementsModal.onClose();
      form.reset();
    }

  }
  const onClose = async () => {
    agreementsModal.onClose();
    form.reset();
  }

  const acceptConnection = async (val) => {
    let agreement_id = ""
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: '/api/v2/agreements/enduser/',
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiAccessToken}`
      },
      data: {
        "institution_id": val.id,
        "max_historical_days": val.transaction_total_days
      }
    };

    axios.request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        agreement_id = response.data.id

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: '/api/v2/requisitions/',
          headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiAccessToken}`
          },
          data: {
            "redirect": "http://localhost:5173/",
            "institution_id": val.id,
            "agreement": agreement_id,
            "user_language": "PL"
          }
        };

        axios.request(config)
          .then((response) => {
            const data = response.data
            console.log(JSON.stringify(response.data));
            console.warn(JSON.stringify(response.data.id));
            const expires_at = new Date(data.created)
            expires_at.setDate(expires_at.getDate() + parseInt(val.transaction_total_days));
            console.warn(expires_at)
            const responseData = {
              "agreement_id": data.id,
              "created_at": data.created,
              "status": data.status,
              "institution_id": data.institution_id,
              "expires_at": expires_at,
              "logo_url": val.logo,
              "category": {}
            }

            axiosSesion
              .post('http://127.0.0.1:8000/agreements/', responseData)
              .then((resp) => {
                window.location.href = response.data.link
              })
              .catch((error) => {
                console.log(error);
              });

            // What to save:
            //![O] status -> (checking (5s) for all not ready accounts if ready)
            //[X] id
            //[X] access_valid_for_days + created_at
            //[X] saved logo
            //[X] bank name
            //[X] blank category
            //[] pass for fetch by server (->celery worker)

          })
          .catch((error) => {
            console.log(error);
          });

      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <Modal
      title="Create api connection"
      description="Add a new api connection to fetch transaction from accounts"
      isOpen={agreementsModal.isOpen}
      onClose={onClose}
    >
      <div className="flex flex-wrap w-full">
        {apiData.map((val) =>
          <TooltipProvider key={val.id} delayDuration={400} disableHoverableContent={true}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="w-18 h-12 m-2" onClick={() => acceptConnection(val)}><img src={val.logo} width="42" height="42" className="rounded-md object-cover" alt={val.name} /></Button>
              </TooltipTrigger>
              <TooltipContent side={"bottom"}>
                {val.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </Modal>
  );
}