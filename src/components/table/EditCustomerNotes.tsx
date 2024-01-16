import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/components/ui/use-toast";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

const EditCutomerNotes = ({
  notes,
  number,
  restaurantId,
}: {
  notes: string;
  number: string;
  restaurantId: string;
}) => {
  const { toast } = useToast();
  const [disabled, setDisabled] = useState<boolean>(true);

  const onSubmit = (e: any) => {
    e.preventDefault();
    const newNotes = e.target[`customerNotes${number}`].value;

    setDoc(doc(db, "restaurants", restaurantId, "userProfiles", number), {
      notes: newNotes,
      restaurantId,
    })
      .then(() =>
        toast({
          title: "Customer Notes",
          description: "Successfully updated customer notes",
          duration: 1500,
        })
      )
      .catch(() =>
        toast({
          title: "Error",
          description: "Error updating customer notes",
          variant: "destructive",
          duration: 1500,
        })
      );
  };

  return (
    <form onSubmit={onSubmit}>
      <textarea
        id={`customerNotes${number}`}
        name={`customerNotes${number}`}
        onChange={() => setDisabled(false)}
        defaultValue={notes}
        className="w-full p-2 border border-gray-300 rounded"
        required
      />
      <Button disabled={disabled} className="mt-4">
        Save
      </Button>
    </form>
  );
};

export default EditCutomerNotes;
