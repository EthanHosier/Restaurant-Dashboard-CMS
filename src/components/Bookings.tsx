
import { Calendar, CalendarClock, Plus, CalendarCheck } from 'lucide-react'

import { Booking, columns } from "./table/bookings-columns"
import { DataTable } from "./table/data-table"
import DataCard from "./DataCard"
import BookingData from '@/types/BookingData'
import { getTimeString, dateIsToday, dateIsFuture, dateIsPast, getCustomerNotes } from '@/lib/utils'
import { Link } from "react-router-dom";
import UserProfile from '@/types/UserProfile'
import useAuth from '@/hooks/useAuth'

const iconWidth = 20;

const Bookings = ({ bookings, selectedLocation, userProfiles }: { bookings: BookingData[], selectedLocation: string, userProfiles: UserProfile[] }) => {
  const allBookings = getData(bookings, selectedLocation)
  const todaysBookings = allBookings.filter(e => dateIsToday(e.date));
  const futureBookings = allBookings.filter(e => dateIsFuture(e.date));
  const pastBookings = allBookings.filter(e => dateIsPast(e.date));

  const auth = useAuth();


  function getData(bookings: BookingData[], selectedLocation: string): Booking[] {
    //async
    //: Promise<Payment[]>
    // Fetch data from your API here.

    const data = bookings.filter(b => b.locationId === selectedLocation || selectedLocation === "all").map((b) => {
      const {
        id,
        startDateTime,
        firstName,
        surname,
        mobileNumber,
        email,
        partySize,
        comments,
        restaurantId,
        restaurantTitle,
        location,
        messageId
      } = b;

      return (
        {
          id,
          date: startDateTime,
          time: getTimeString(startDateTime),
          firstName,
          surname,
          mobileNumber,
          email,
          partySize,
          comments,
          restaurantTitle,
          location,
          restaurantId,
          messageId,
          customerNotes: getCustomerNotes(mobileNumber, userProfiles)
        }
      )
    }).sort((a, b) => (new Date(a.date) as any) - (new Date(b.date) as any))



    return data;
  }

  return (
    <>
      <Link to={`https://d303vz01x9nm1g.cloudfront.net?restaurantId=${auth.user.uid}`} target={"_blank"} className='hidden sm:inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 mt-2 -mb-4 w-36'>
        <div className='flex items-center'>
          <Plus size={16} color="white" /><p className='ml-1'>New Booking</p>
        </div>
      </Link>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <div>
          <DataCard title="Today's Bookings" value={todaysBookings.length} comment="" icon={<Calendar width={iconWidth} />} />
        </div> {/* Component A */}

        <div>
          <DataCard title="Upcoming Bookings" value={allBookings.length - pastBookings.length} comment="" icon={<CalendarClock width={iconWidth} />} />
        </div> {/* Component B */}

        <div>
          <DataCard title="Total Bookings" value={allBookings.length} comment="" icon={<CalendarCheck width={iconWidth} />} />
        </div> {/* Component A */}


        <div className="sm:col-span-2 lg:col-span-4">
          <DataTable columns={columns} data={todaysBookings} title="Today's Bookings" hiddenColumns={["date"]} defaultPageSize={5} />
        </div> {/* Component E */}

        <div className="sm:col-span-2 lg:col-span-4 mt-4">
          <DataTable columns={columns} data={futureBookings} title="Future Bookings" hiddenColumns={[]} defaultPageSize={5} />
        </div> {/* Component F */}

        <div className="sm:col-span-2 lg:col-span-4 mt-4">
          <DataTable columns={columns} data={pastBookings} title="Past Bookings" hiddenColumns={[]} defaultPageSize={5} />
        </div> {/* Component G */}
      </div>
    </>
  )
}





export default Bookings