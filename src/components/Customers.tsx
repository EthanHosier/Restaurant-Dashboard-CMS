import React from 'react'

import { Calendar, CalendarClock, Users, BadgeCheck } from 'lucide-react'

import { PendingReview, columns as reviewColumns } from './table/pending-reviews-columns'
import { Customer, columns as allCustomerColumns } from "./table/customers-columns"
import { DataTable } from "./table/data-table"
import DataCard from "./DataCard"
import BookingData from '@/types/BookingData'
import User from '@/types/User'
import { getCustomerNotes, getTimeString } from '@/lib/utils'
import Location from '@/types/Locations'
import UserProfile from '@/types/UserProfile'

const iconWidth = 20;

const Customers = ({ bookings, selectedLocation, allLocations, userProfiles }: { bookings: BookingData[], selectedLocation: string, allLocations: Location[], userProfiles: UserProfile[] }) => {

  function isMaxStayDurationExceeded(startDateTime: Date, locationId: string) {

    const location = allLocations.find(l => l.locationId === locationId);

    if (!location) return false;

    const maxStayDuration = location.maxStayDuration;

    const currentDate = new Date();
    const endTime = new Date(startDateTime.getTime() + maxStayDuration * 60000); // Convert minutes to milliseconds

    return endTime < currentDate;
  }

  function getRevData(bookings: BookingData[], selectedLocation: string): PendingReview[] {

    const pendingReviews = bookings.filter(e => !e.sentReview && (e.locationId === selectedLocation || selectedLocation === "all") && isMaxStayDurationExceeded(new Date(e.startDateTime), e.locationId))
    .map(b => {
      const {
        id,
        startDateTime,
        firstName,
        surname,
        mobileNumber,
        email,
        partySize,
        restaurantId,
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
          customerNotes: getCustomerNotes(email, userProfiles),
          restaurantId,
        }
      )
    }
    )
    return pendingReviews;
  }

  function getCustomerData(bookings: BookingData[], selectedLocation: string): Customer[] {

    const usersEmails = new Set();
    let users: User[] = [];
  
    bookings.filter(b => b.locationId === selectedLocation || selectedLocation === "all").forEach((b, i) => {
      if (usersEmails.has(b.email)) {
        //incremement number of visits
        const foundUser = users.find(obj => obj["email"] === b.email);
        if (foundUser) {
          foundUser.totalVisits = foundUser.totalVisits + 1;
        }
      } else {
        //new user
        usersEmails.add(b.email);
  
        const {
          firstName,
          surname,
          mobileNumber,
          email,
          restaurantId,
        } = b;
  
        const user: User = {
          id: i + "",
          firstName,
          surname,
          mobileNumber,
          email,
          customerNotes: getCustomerNotes(email, userProfiles),
          totalVisits: 1,
          restaurantId,
        }
        users.push(user);
      }
    })
  
    return users;
  
  }

  const pendingRevData = getRevData(bookings, selectedLocation)
  const allCustomerData = getCustomerData(bookings, selectedLocation);


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <div className='sm:col-span-1 lg:col-span-2'>
        <DataCard title="Total Customers" value={allCustomerData.length} comment="+3 today" icon={<Users width={iconWidth} />} />
      </div> {/* Component B */}
      <div className='sm:col-span-1 lg:col-span-2'>
        <DataCard title="Pending Reviews" value={pendingRevData.length} comment="+3 today" icon={<BadgeCheck width={iconWidth} />} />
      </div> {/* Component C */}
      <div className="sm:col-span-2 lg:col-span-4 mt-4">
        <DataTable columns={reviewColumns} data={pendingRevData} title="Pending Reviews" hiddenColumns={["time", "partySize"]} defaultPageSize={5} />
      </div> {/* Component E */}
      <div className="sm:col-span-2 lg:col-span-4 mt-4">
        <DataTable columns={allCustomerColumns} data={allCustomerData} title="All Customers" hiddenColumns={[]} defaultPageSize={5} />
      </div> {/* Component F */}

    </div>
  )
}







export default Customers