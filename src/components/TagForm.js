import Form from "./Form";

export default function TagForm({ editedTag, abortAction }) {
  return <Form title={classes => editedTag} abortAction={abortAction} />;
}
