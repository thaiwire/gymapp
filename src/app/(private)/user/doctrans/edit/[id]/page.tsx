import PageTitle from "@/components/ui/page-title";
import React from "react";
import DocForm from "../../_components/doc-form";

function EditDocPage() {
  // temp
  let initialValues = {};

  return (
    <div>
      <PageTitle title="Edit Document" />
      <DocForm formType="edit" initialValues={initialValues} />
    </div>
  );
}

export default EditDocPage;
