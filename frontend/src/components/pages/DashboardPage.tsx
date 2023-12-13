import React from "react";
import { useDocumentTitleComponent } from "@/components/global";


import Layout from "../layout/dashboad_layout";
import { ChartBalanceCard } from "@/components/chart-balance-card";
import { ChartInOutcomesCard } from "../chart-expensives-incomes-card";
import { RaportCard } from "../raport-card";

interface IProps {
  msg: string;
}

export const DashboardPage: React.FC<IProps> = ({ msg }) => {
  useDocumentTitleComponent({ title: msg })

  return (
    <Layout>
      <RaportCard />
      {/* <ChartBalanceCard /> */}
      {/* <ChartInOutcomesCard /> */}
    </Layout>
  );
};
