import React, { useEffect, useState } from "react";
import { useDocumentTitleComponent } from "@/components/global";


import Layout from "../layout/dashboad_layout";
import { ConnectionScrollList } from "@/components/ui/connectionScrollList";
import { BalanceCard } from "@/components/balance-card";

import { TransactionsCard } from "@/components/transations-card"

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


  return (
    <Layout>
      <TransactionsCard />
      <ConnectionScrollList className="" />
      <BalanceCard />
    </Layout>
  );
};
