import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import EditCutomerNotes from './EditCustomerNotes'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from '../ui/input'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useToast } from '../ui/use-toast'
import { formatDate } from '@/lib/utils'


const Actionsbcs = ({ row }: { row: any }) => {
  const [reason, setReason] = useState("");

  const { toast } = useToast();

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
        messageId,
        date,
        time
      } = row.original;

      const body = { email, id, restaurantTitle, location, reason, messageId };

      toast({
        title: "Cancelled Booking",
        description: `Booking at ${time} on ${formatDate(date)} cancelled.`,
      })

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
    <DropdownMenu>
      <DropdownMenuTrigger><MoreHorizontal /></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />


        <div className="w-full">
          <Dialog>
            <DialogTrigger className='hover:bg-[#F9FBFD] w-full justify-start p-2 rounded'>
              <div className='flex items-center'>
                <p className='text-start text-sm mr-1'>View Comments</p>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Comments</DialogTitle>
                <DialogDescription>
                  {row.original.comments || "--"}
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

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
                <EditCutomerNotes notes={row.original.customerNotes} number={row.original.mobileNumber} restaurantId={row.original.restaurantId} />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className='w-full'>
          <AlertDialog>
            <AlertDialogTrigger className='hover:bg-[#F9FBFD] w-full justify-start p-2 rounded'>
              <div className='flex items-center'>
                <p className='text-start text-sm mr-1'>Cancel Booking</p>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The customer will be alerted by email that their booking has been cancelled.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="w-full">
                <div className="flex items-center">
                  <Label htmlFor="name" className="text-right mr-4">
                    Reason
                  </Label>
                  <Input id="name" className="col-span-3" onChange={(e) => setReason(e.target.value)} value={reason} />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelBooking}>Cancel Booking</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Actionsbcs