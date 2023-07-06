"use client"
 
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import EditCutomerNotes from "./EditCustomerNotes";
import { Checkbox } from "@/components/ui/checkbox"
import { isToday, isTomorrow, truncateComment } from "@/lib/utils"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type PendingReview = {
  id: string //this needs to be different regardless of user (as if have more than 1 review pending)
  date: Date,
  time: String,
  firstName: String,
  surname: String,
  mobileNumber: string,
  email: string,
  partySize: Number,
  customerNotes: string,
  restaurantId: string,
  websiteUrl: string,
  restaurantName: string,
}

export const columns: ColumnDef<PendingReview>[] = [
  {id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
},
  {
    accessorKey: "date",
    header: "Date",
    cell: ({row}) => {
      const date: Date = row.getValue("date");
      return (isToday(date)? "Today": isTomorrow(date)? "Tomorrow": date.toLocaleDateString())
    }
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "partySize",
    header: "Size",
    cell: ({row}) => {
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
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile Number",
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
      //const payment = row.original
 
      //console.log({HERE: row.original})

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="w-full">
              <Dialog>
                <DialogTrigger className='hover:bg-[#F9FBFD] w-full justify-start p-2 rounded'>
                  <div className='flex items-center'>
                    <p className='text-start text-sm mr-1'>View Customer Notes</p>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="mb-4">Customer Notes</DialogTitle>
                    <EditCutomerNotes notes={row.original.customerNotes} number={row.original.mobileNumber} restaurantId={row.original.restaurantId}/>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
]