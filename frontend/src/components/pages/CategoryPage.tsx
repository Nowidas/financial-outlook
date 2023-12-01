import React from "react";
import { useDocumentTitleComponent } from "@/components/global";
import { CategoryCard } from "@/components/category-card"

import Layout from "../layout/dashboad_layout";


interface IProps {
  msg: string;
}


export const CategoryPage: React.FC<IProps> = ({ msg }) => {
  useDocumentTitleComponent({ title: msg })

  return (
    <Layout>
      <CategoryCard />
    </Layout>
  );
};
