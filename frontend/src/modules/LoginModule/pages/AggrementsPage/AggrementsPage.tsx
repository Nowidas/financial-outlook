import React, { useEffect, useState } from "react";
import "./AggrementsPage.scss";
import { useDocumentTitleComponent } from "@/global-components";

import useAxiosWithInterceptor from "@/helpers/sesioninterceptor";
import axiosSesion from "@/helpers/sesioninterceptor";
import useCrud from "@/hooks/useCrud"

interface IProps {
  msg: string;
}

interface MyData {
  // Define the structure of your data here
  // Example:
  id: number;
  agreement_id: string;
  created_at: string;
  institution_id: string;
}

export const AggrementsPage: React.FC<IProps> = ({ msg }) => {
  useDocumentTitleComponent({ title: 'Spotify - AggrementsPage' })
  const crudData = useCrud([], 'agreements')
  const { dataCRUD, error, isLoading, fetchData } = crudData;
  useEffect(() => {
    const fetchDataAndHandleErrors = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataAndHandleErrors();
  }, []);

  console.log(dataCRUD?.results?.map((el) => el.agreement_id));
  return (
    <>
      <h3>Hi</h3>
      <div className="form-signin mt-5 text-center">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        <ul>
          {!isLoading && dataCRUD?.results?.map((el) => (
            <li key={el.agreement_id}>{el.agreement_id}:{el.institution_id} (expires_at: {el.created_at})</li>
          ))}
        </ul>

      </div>
    </>
  );
};
