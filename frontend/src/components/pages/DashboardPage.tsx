import React from "react";
import { useDocumentTitleComponent } from "@/components/global";


import Layout from "../layout/dashboad_layout";
import { ChartBalanceCard } from "@/components/chart-balance-card";
import { ChartInOutcomesCard } from "../chart-expensives-incomes-card";

interface IProps {
  msg: string;
}

export const DashboardPage: React.FC<IProps> = ({ msg }) => {
  useDocumentTitleComponent({ title: msg })

  return (
    <Layout>
      <ChartBalanceCard />
      <ChartInOutcomesCard />
    </Layout>
  );
};
