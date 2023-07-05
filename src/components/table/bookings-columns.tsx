"use client"

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isToday, isTomorrow, truncateComment } from "@/lib/utils"
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import EditCutomerNotes from "./EditCustomerNotes";
import Actionsbcs from "./Actions-bcs";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Booking = {
  id: string
  date: Date,
  time: String,
  firstName: String,
  surname: String,
  mobileNumber: String,
  email: string,
  partySize: Number,
  comments: String,
  restaurantId: string,
  restaurantTitle: string,
  location: string,
  messageId: string,
  customerNotes: string,
}

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },

    cell: ({ row }) => {
      const date: Date = row.getValue("date");
      return (isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : date.toLocaleDateString())
    },
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "partySize",
    header: "Size",
    cell: ({ row }) => {
      const partySize: number = row.getValue("partySize");
      return (partySize);
    }
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "surname",
    header: "Surname",
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile Number",
    cell: ({ row }) => {
      return <a href={`tel: +${row.original.mobileNumber}`}>+{row.original.mobileNumber}</a>
    }
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "comments",
    header: "Comments",
    cell: ({ row }) => {
      const str: string = row.original.comments as string;
      return str === "" || !str || str.length <= 20 ? (str || "--") : (
        <HoverCard>
          <HoverCardTrigger>{truncateComment(str)}</HoverCardTrigger>
          <HoverCardContent>
            <p className="text-wrap">{str}</p>
          </HoverCardContent>
        </HoverCard>
      );
    }
  },
  {
    accessorKey: "customerNotes",
    header: "Customer Notes",
    cell: ({ row }) => {
      const notes = row.original.customerNotes;
      return (
        <HoverCard>
          <HoverCardTrigger>{truncateComment(notes || "--")}</HoverCardTrigger>
          <HoverCardContent>
            <EditCutomerNotes notes={notes} email={row.original.email} restaurantId={row.original.restaurantId} />
          </HoverCardContent>
        </HoverCard>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      //console.log(row.original.comments)

      const date: Date = row.getValue("date");

      const dateToCheck = new Date(date);


      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      dateToCheck.setHours(0, 0, 0, 0);

      let reason = "";

      const onReasonChange = (e: any) => {
        reason = e;
      }

      const handleCancelBooking = async () => {

        //console.log(row.original.id)

        //console.log(row.original.email);

        try {
          const ref = doc(db, "bookings", row.original.id);
          await deleteDoc(ref);

          const apiKey = 'willybum';

          const URL = 'https://us-central1-management-restaurants.cloudfunctions.net/api/bookings/handleCancellation';

          //(row.original)

          const {
            email,
            id,
            restaurantTitle,
            location,
            messageId
          } = row.original;

          const body = { email, id, restaurantTitle, location, reason, messageId };

          /*const res =*/ await fetch(URL, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
            },
            body: JSON.stringify(body)
          })


        } catch (error) {
          console.log("error cancelling booking ", error)
        }
      }




      return (
        <Actionsbcs row={row}/>
      )
    },
  }
]