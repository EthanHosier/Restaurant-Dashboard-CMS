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
import {truncateComment } from "@/lib/utils"
import EditCutomerNotes from "./EditCustomerNotes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Customer = {
  id: string //this needs to be different regardless of user (as if have more than 1 review pending)
  firstName: String,
  surname: String,
  mobileNumber: String,
  email: string,
  customerNotes: string,
  totalVisits: number,
  restaurantId: string,
}

export const columns: ColumnDef<Customer>[] = [
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
            <EditCutomerNotes notes={notes} email={row.original.email} restaurantId={row.original.restaurantId} />
          </HoverCardContent>
        </HoverCard>
      )
    }
  },
  {
    accessorKey: "totalVisits",
    header: "Total visits"
  },
  {
    id: "actions",
    cell: ({ row }) => {
      //const payment = row.original

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
                    <EditCutomerNotes notes={row.original.customerNotes} email={row.original.email} restaurantId={row.original.restaurantId} />
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