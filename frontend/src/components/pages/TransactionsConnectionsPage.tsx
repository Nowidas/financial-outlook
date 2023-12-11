import React from "react";
import { useDocumentTitleComponent } from "@/components/global";
import { ConnectionScrollList } from "@/components/ui/connectionScrollList";
import { BalanceCard } from "@/components/balance-card";
import { TransactionsCard } from "@/components/transations-card"

import Layout from "../layout/dashboad_layout";


interface IProps {
  msg: string;
}


export const TransactionsConnectionsPage: React.FC<IProps> = ({ msg }) => {
  useDocumentTitleComponent({ title: msg })

  return (
    <Layout>
      <TransactionsCard />
      <ConnectionScrollList />
      <BalanceCard />
    </Layout>
  );
};
