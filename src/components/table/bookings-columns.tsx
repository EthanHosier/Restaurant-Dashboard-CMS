"use client"

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

import { isToday, isTomorrow, truncateComment } from "@/lib/utils"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"


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
  mobileNumber: string,
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
            <EditCutomerNotes notes={notes} number={row.original.mobileNumber} restaurantId={row.original.restaurantId} />
          </HoverCardContent>
        </HoverCard>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      //console.log(row.original.comments)

      return (
        <Actionsbcs row={row}/>
      )
    },
  }
]