import type { MetaFunction } from "@remix-run/node";
import { FormBuilderLayout } from "~/components/FormBuilderLayout";

export const meta: MetaFunction = () => {
  return [
    { title: "Form Builder" },
    { name: "description", content: "Create and customize forms with drag-and-drop interface" },
  ];
};

export default function Index() {
  return <FormBuilderLayout />;
}
