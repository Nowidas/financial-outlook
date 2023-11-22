import React from "react";
import { useDocumentTitleComponent } from "@/components/global";


import Layout from "../layout/dashboad_layout";
import { ConnectionScrollList } from "@/components/ui/connectionScrollList";
import { BalanceCard } from "@/components/balance-card";
import { ChartBalanceCard } from "@/components/chart-balance-card";

import { TransactionsCard } from "@/components/transations-card"
import { ChartInOutcomesCard } from "../chart-expensives-incomes-card";

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

export const DashboardPage: React.FC<IProps> = ({ msg }) => {
  useDocumentTitleComponent({ title: 'Financial Outlook' })


  return (
    <Layout>
      <TransactionsCard />
      <ConnectionScrollList />
      <BalanceCard />
      <ChartBalanceCard />
      <ChartInOutcomesCard />
    </Layout>
  );
};