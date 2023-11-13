import GroupForm from "./GroupForm";

const CreateGroupForm = () => {
  const group = {
    understanding: '',
    improvement: '',
  };

  /* **DO NOT CHANGE THE RETURN VALUE** */
  return (
    <GroupForm
      group = {group}
      formType="Create Group"
    />
  );
};

export default CreateGroupForm;
