import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardTitle } from './ui/card'
import { generateTimeIntervals, toTitleCase, DAYS_OF_WEEK } from '@/lib/utils'
import { Trash2, Plus, Save, MoreHorizontal, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid';
import BookingData from '@/types/BookingData'
import Location from '@/types/Locations'
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
import RingLoader from "react-spinners/RingLoader";
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import useAuth from '@/hooks/useAuth'
import { Checkbox } from "@/components/ui/checkbox"
import ReviewOption from '@/types/ReviewOption'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const DEFAULT_TABLE_SIZE: number = 1;

const DELIVERY_OPTIONS = ["uber eats", "deliveroo", "just eat"]
const PICKUP_OPTIONS = /*(["A", "B", "C"]*/ DELIVERY_OPTIONS;
const REVIEW_OPTIONS = ["google", "yelp", "tripadvisor"]

enum CheckboxType {
  Pickup,
  Delivery
}

//TODO: when adding venue, set a unique id just to represent it now (then when read from db, can just use the db id)
//will need to map over Object.keys (as will be object here)

const timeIntervals = generateTimeIntervals("00:00", "23:45");

const pickupDeliveryOptionsMacro = (checkboxType: CheckboxType) => checkboxType === CheckboxType.Delivery ? "deliveryOptions" : "pickupOptions"

const Restaurant = ({ /*bookings,*/ locations: existingLocations }: { bookings: BookingData[], locations: Location[] }) => {

  //console.log(existingLocations);

  const [formData, setFormData] = useState<Location[]>(existingLocations);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>("");
  const [canSave, setCanSave] = useState<boolean>(false); //use must make a change in order to be able to save
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const auth = useAuth();

  const enableSaving = () => setCanSave(true);

  const handleCapacityChange = (location: Location, id: string, capacity: number) => {

    let index = location.tables.findIndex(obj => obj.id === id);
    if (index !== -1) {
      location.tables[index].capacity = capacity;
    }
    setFormData(f => [...f]);
    enableSaving();
  };

  const addVenue = () => {
    const uuid1 = uuidv4();
    const uuid2 = uuidv4();

    const initialState: Location = {
      name: '',
      location: '',
      address: '',
      contactNumber: '',
      contactEmail: '',
      maxStayDuration: 120,
      locationId: uuid1,
      restaurantId: auth.user.uid,
      pickup: false,
      delivery: false,
      pickupOptions: [],
      deliveryOptions: [],
      reviewOptions: [],
      openingTimes: {
        monday: {
          open: "00:00",
          close: "23:45",
        },
        tuesday: {
          open: "00:00",
          close: "23:45",
        },
        wednesday: {
          open: "00:00",
          close: "23:45",
        },
        thursday: {
          open: "00:00",
          close: "23:45",
        },
        friday: {
          open: "00:00",
          close: "23:45",
        },
        saturday: {
          open: "00:00",
          close: "23:45",
        },
        sunday: {
          open: "00:00",
          close: "23:45",
        },
      },
      tables: [
        {
          id: uuid2,
          capacity: DEFAULT_TABLE_SIZE
        }
      ],
    };

    setFormData(currentData => {
      return [...currentData, initialState]
    })
    enableSaving();

  }

  const handleRemoveTable = (location: Location, id: string) => {
    let index = location.tables.findIndex(obj => obj.id = id);
    if (index !== -1) {
      location.tables.splice(index, 1);
    }

    setFormData(f => [...f]);
    enableSaving();

  };

  const addTable = (location: Location) => {
    const uuid = uuidv4();
    location.tables.push({ id: uuid, capacity: DEFAULT_TABLE_SIZE });
    setFormData(f => [...f]);
    enableSaving();

  }

  const handleRemoveLocation = async (locationId: string) => {
    //check if there are any existing bookings for this location already.
    // if so, block delete

    //const existsABooking = bookings.some(booking => booking.locationId = locationId);

    //remove location locally
    setFormData(data => data.filter(location => location.locationId != locationId));
    //TODO: remove location on firebase too


    //if not in database, don't need to remove location.
    if (!existingLocations.some(obj => obj.locationId === locationId)) {
      return;
    }

    setLoading(true);
    //FIRESTORE CLIENT LOGIC:
    try {
      const parentRef = doc(db, "restaurants", auth.user.uid);
      const subdocRef = doc(collection(parentRef, "locations"), locationId);
      await deleteDoc(subdocRef);
    } catch (error) {
      setError(error);
    }

    setLoading(false);




    //SHOULD I ALLOW SAVING?????? I'M PRETTY SURE NOT BUT TIRED LOGIC ###########################
  }


  const handleMaxStayDurationChange = (location: Location, maxStayDuration: number) => {
    location.maxStayDuration = maxStayDuration;
    setFormData(f => [...f]);
    enableSaving();

  }

  const handleChangeDefault = (location: Location, key: string, value: string) => {

    switch (key) {
      case "name": {
        location.name = value;
        break;
      }
      case "location": {
        location.location = value;
        break;
      }
      case "address": {
        location.address = value;
        break;
      }
      case "contactNumber": {
        location.contactNumber = value;
        break;
      }
      case "contactEmail": {
        location.contactEmail = value;
        break;
      }
    }

    setFormData(f => [...f]);
    enableSaving();
  };



  const handleOpenCloseTimeChange = (location: Location, day: number, type: string, time: string) => {

    const dow = DAYS_OF_WEEK[day];

    const key = dow as keyof typeof location.openingTimes;
    if (type == "open") {
      location.openingTimes[key].open = time;
      if (location.openingTimes[key].close < time) {
        location.openingTimes[key].close = time;
      }
    } else if (type == "close") {
      location.openingTimes[key].close = time;
      if (location.openingTimes[key].open > time) {
        location.openingTimes[key].open = time;
      }
    }
    setFormData(f => [...f]);
    enableSaving();

  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // Perform form submission logic with formData
    //console.log("submit")
    //console.log(formData)

    //TODO: check if have actually made changes (so reduces number of writes + i guess reads)

    //currently, fuck it ^

    setSaveLoading(true);

    const promises = formData.map((f) => {
      const docRef = doc(db, "restaurants", auth.user.uid, "locations", f.locationId);
      return setDoc(docRef, f);
    })



    try {
      await Promise.all(promises);
      //success
      setCanSave(false);
    } catch (error) {
      setError(error);
    }


    setSaveLoading(false);

  };



  const handleCheckboxChange = (location: Location, type: CheckboxType) => {


    switch (type) {
      case CheckboxType.Delivery:
        location.delivery = !location.delivery;
        break;

      case CheckboxType.Pickup:
        location.pickup = !location.pickup;
        break;
    }

    setFormData(f => [...f]);
    enableSaving();
  }

  //delivery/pickup option:
  const addPickupDelivery = (location: Location, checkboxType: CheckboxType) => {
    const options = pickupDeliveryOptionsMacro(checkboxType);
    location[options].push({ type: "uber eats", url: "" });
    setFormData(f => [...f]);
    enableSaving();

  }

  const removePickupDelivery = (location: Location, checkboxType: CheckboxType, index: number) => {
    const options = pickupDeliveryOptionsMacro(checkboxType);

    location[options].splice(index, 1);
    setFormData(f => [...f]);
    enableSaving();

  }

  const changePickupDeliveryType = (location: Location, checkboxType: CheckboxType, index: number, type: string) => {
    const options = pickupDeliveryOptionsMacro(checkboxType);

    location[options][index].type = type;
    setFormData(f => [...f]);
    enableSaving();
  }

  const changePickupDeliveryUrl = (location: Location, checkboxType: CheckboxType, index: number, url: string) => {

    const options = pickupDeliveryOptionsMacro(checkboxType);
    console.log(location)
    location[options][index].url = url;
    setFormData(f => [...f]);
    enableSaving();

  }

  //review options:
  const addReviewOption = (location: Location) => {
    const element: ReviewOption = { type: "google", url: "" };
    location.reviewOptions ? location.reviewOptions.push(element) : location.reviewOptions = [element];
    setFormData(f => [...f]);
    enableSaving();
  }

  const removeReviewOption = (location: Location, index: number) => {
    location.reviewOptions.splice(index, 1);
    setFormData(f => [...f]);
    enableSaving();
  }

  const changeReviewOptionType = (location: Location, index: number, type: string) => {
    location.reviewOptions[index].type = type;
    setFormData(f => [...f]);
    enableSaving();
  }

  const changeReviewOptionUrl = (location: Location, index: number, url: string) => {
    location.reviewOptions[index].url = url;
    setFormData(f => [...f]);
    enableSaving();
  }

  return (
    <div className='flex flex-col items-start'>
      {error && <p className='text-red-600'>Please contact support. Error: {error}</p>}
      {loading ?
        <div className='w-full flex items-center justify-center'>
          <RingLoader color='black' />
        </div>
        :
        <>
          <Card className='w-full p-4 mt-4 bg-[#F1F5F9]'>
            <Card className="p-4 mb-4 w-full">
              <CardTitle>Common Questions</CardTitle>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Why aren't my URLs working?</AccordionTrigger>
                  <AccordionContent>
                    Please ensure that you are including the "https://" part at the start of each url. For example "https://www.google.com"
                    will work, but "www.google.com" will not work.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

            </Card>

            <Button
              className=''
              onClick={addVenue}
            ><Plus size={16} color="white" className="mr-2"/> <p className="ml-2">Add Venue</p></Button>
            <div className='w-full'>
              <form className="w-full mx-auto mt-4" onSubmit={handleSubmit}>

                <Button
                  disabled={saveLoading || !canSave}
                  className={`${!canSave ? "bg-[#E4EAF1]" : "bg-green-600"} hover:bg-green-500 fixed bottom-6 right-6 p-6`}
                  type='submit'
                >
                  {saveLoading ? <Loader2 className='animate-spin' size={20} /> : <Save size={20} color="white" />}
                  <p className='ml-2 text-xl'>Save</p>
                </Button>

                <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {formData.map((location, i) => (
                    <Card className='p-4 mb-16 w-full xl:flex-1' key={i}> {/* ##################################### */}

                      <div className='w-full flex justify-between mt-4'>
                        <CardTitle className='text-xl'>
                          Venue {i + 1}
                        </CardTitle>


                        <DropdownMenu>
                          <DropdownMenuTrigger><MoreHorizontal /></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Venu {i + 1}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className='w-full'>
                              <AlertDialog>
                                <AlertDialogTrigger className='hover:bg-[#F9FBFD] w-full justify-start p-2 rounded'>
                                  <div className='flex items-center'>
                                    <p className='text-start text-sm mr-1'>Delete</p>
                                  </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete {location.name ? `${location.name} ` : "this venue "}
                                      from our database.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveLocation(location.locationId)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>



                      </div>

                      <div className="my-4">
                        <label htmlFor="restaurantName" className="block font-medium mb-1">
                          {/*Restaurant Name*/}Venue Name
                        </label>
                        <input
                          type="text"
                          id="restaurantName"
                          name="restaurantName"
                          value={location.name}
                          onChange={(e) => handleChangeDefault(location, "name", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="location" className="block font-medium mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          id="location"
                          name="location"
                          value={location.location}
                          onChange={(e) => handleChangeDefault(location, "location", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="address" className="block font-medium mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={location.address}
                          onChange={(e) => handleChangeDefault(location, "address", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="contactNumber" className="block font-medium mb-1">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          id="contactNumber"
                          name="contactNumber"
                          value={location.contactNumber}
                          onChange={(e) => handleChangeDefault(location, "contactNumber", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
                          title="Please enter a valid phone number"
                          required
                        />

                      </div>

                      <div className="mb-4">
                        <label htmlFor="contactEmail" className="block font-medium mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          id="contactEmail"
                          name="contactEmail"
                          value={location.contactEmail}
                          onChange={(e) => handleChangeDefault(location, "contactEmail", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded"
                          required
                        />
                      </div>

                      <div className="my-4">
                        <label htmlFor="restaurantName" className="block font-medium mb-1">
                          {/*Restaurant Name*/}Maximum Stay Duration (mins)
                        </label>
                        <input
                          type="number"
                          min="0"
                          id={`maxStay}`}
                          name={`maxStay`}
                          value={location.maxStayDuration}
                          onChange={(e) => handleMaxStayDurationChange(location, parseInt(e.target.value))}
                          className="flex-1 p-2 border border-gray-300 rounded w-full"
                        />
                      </div>

                      <Card className='p-4 mt-4'>

                        <CardTitle>
                          Opening Times
                        </CardTitle>

                        {Object.keys(location.openingTimes).sort((a, b) => {
                          const order = DAYS_OF_WEEK;
                          return order.indexOf(a) - order.indexOf(b);
                        }).map((e, i) => (
                          <div key={i}>
                            <div className='flex justify-around items-center mt-4'>
                              <p className='text-md w-28 font-normal'>
                                {toTitleCase(e)}
                              </p>
                              <div className="mb-4 w-28">
                                {
                                  i === 0 && <label htmlFor="mondayOpen" className="block font-medium mb-1">
                                    Opening Time
                                  </label>
                                }
                                <select
                                  id="mondayOpen"
                                  name="mondayOpen"
                                  value={location.openingTimes[DAYS_OF_WEEK[i] as keyof typeof location.openingTimes]?.open}
                                  onChange={(e) => handleOpenCloseTimeChange(location, i, "open", e.target.value)}
                                  className="w-full p-2 border border-[#E2E8F0] rounded bg-[#F1F5F9]"
                                  required
                                >
                                  {/*<option value="">Opening time</option>*/}
                                  {timeIntervals.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="mb-4 w-28">

                                {i === 0 &&
                                  <label htmlFor="mondayClose" className="block font-medium mb-1">
                                    Closing Time
                                  </label>
                                }
                                <select
                                  id="mondayClose"
                                  name="mondayClose"
                                  value={location.openingTimes[DAYS_OF_WEEK[i] as keyof typeof location.openingTimes]?.close}
                                  onChange={(e) => handleOpenCloseTimeChange(location, i, "close", e.target.value)}
                                  className="w-full p-2 border border-[#E2E8F0] rounded bg-[#F1F5F9]"
                                  required
                                >
                                  {/*<option value="">Closing time</option>*/}
                                  {timeIntervals.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </Card>


                      <Card className='mt-4 p-4'>
                        <CardTitle>
                          Tables
                        </CardTitle>

                        <div className='w-full flex flex-col'>
                          {location.tables.length > 0 && <p className='ml-[38px] mt-4 font-medium mb-2'>Capacity</p>}
                          <div className='w-full'>
                            {location.tables.map((table, j) => (
                              <div key={j} className="flex items-center gap-4 mb-4">
                                <p className='w-6'>{j + 1}.</p>
                                <input
                                  type="number"
                                  min="0"
                                  id={`table-${j}`}
                                  name={`table-${j}`}
                                  value={table.capacity}
                                  onChange={(e) => handleCapacityChange(location, table.id, parseInt(e.target.value))}
                                  className="flex-1 p-2 border border-gray-300 rounded w-1/2" //i have no clue why putting w-1/2 fixes this on small screens but oh well fuck it
                                />

                                <Button
                                  type="button"
                                  onClick={() => handleRemoveTable(location, table.id)}
                                  variant="ghost"
                                  className=''
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            ))}
                          </div>

                        </div>
                        <Button
                          className='ml-[40px] mt-4'
                          type='button'
                          onClick={() => addTable(location)}
                        >
                          <Plus size={16} color="white" className="mr-2"/> 
                          Add Table
                        </Button>
                      </Card>


                      <Card className='p-4 mt-4'>
                        <CardTitle>Pickup & Delivery</CardTitle>

                        <div className='flex items-center my-2 mt-4'>
                          <Checkbox
                            checked={location.pickup}
                            onClick={() => handleCheckboxChange(location, CheckboxType.Pickup)}
                          />
                          <p className='ml-2'>Pickup</p>
                        </div>

                        {
                          location.pickup &&
                          <Card className="p-4 overflow-auto">
                            <CardTitle>Pickup Options</CardTitle>
                            <div className='w-full flex flex-col'>
                              {location.pickup && location.pickupOptions.length > 0 &&
                                <div className='flex mt-4 w-8 mb-2'>
                                  <p className='font-medium '>Type</p>
                                  <p className='ml-[106px] font-medium'>URL</p>
                                </div>
                              }

                              <div className='w-full'>
                                {location.pickupOptions.map((pickupOption, j) => (
                                  <div key={j} className="flex items-center gap-4 mb-4">
                                    <select
                                      id={`pickupOption${toTitleCase(location.name)}${j}`}
                                      name={`pickupOption${toTitleCase(location.name)}${j}`}
                                      value={pickupOption.type}
                                      onChange={(e) => changePickupDeliveryType(location, CheckboxType.Pickup, j, e.target.value)}
                                      className="w-32 p-2 border border-[#E2E8F0] rounded bg-[#F1F5F9]"
                                      required
                                    >
                                      {PICKUP_OPTIONS.map((type) => (
                                        <option key={type} value={type}>
                                          {toTitleCase(type)}
                                        </option>
                                      ))}
                                    </select>

                                    <input
                                      id={`pickupUrl-${j}`}
                                      name={`pickupUrl-${j}`}
                                      value={pickupOption.url}
                                      onChange={(e) => changePickupDeliveryUrl(location, CheckboxType.Pickup, j, e.target.value)}
                                      className="flex-1 p-2 border border-gray-300 rounded"
                                    />

                                    <Button
                                      type="button"
                                      onClick={() => removePickupDelivery(location, CheckboxType.Pickup, j)}
                                      variant="ghost"
                                      className=''
                                    >
                                      <Trash2 />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                            </div>
                            <Button
                              className='mt-4'
                              type='button'
                              onClick={() => addPickupDelivery(location, CheckboxType.Pickup)}
                            >
                              <Plus size={16} color="white" className="mr-2"/> 
                              Add Pickup Option
                            </Button>
                          </Card>

                        }

                        <div className='flex items-center my-2 mt-4'>
                          <Checkbox
                            checked={location.delivery}
                            onClick={() => handleCheckboxChange(location, CheckboxType.Delivery)}

                          />
                          <p className='ml-2'>Delivery</p>
                        </div>


                        {
                          location.delivery &&
                          <Card className="p-4 overflow-auto">
                            <CardTitle>Delivery Options</CardTitle>
                            <div className='w-full flex flex-col'>
                              {location.deliveryOptions.length > 0 &&
                                <div className='flex mt-4 w-8 mb-2'>
                                  <p className='font-medium '>Type</p>
                                  <p className='ml-[106px] font-medium'>URL</p>
                                </div>
                              }

                              <div className='w-full'>
                                {location.deliveryOptions.map((deliveryOption, j) => (
                                  <div key={j} className="flex items-center gap-4 mb-4">
                                    <select
                                      id={`deliveryOption${toTitleCase(location.name)}${j}`}
                                      name={`deliveryOption${toTitleCase(location.name)}${j}`}
                                      value={deliveryOption.type}
                                      onChange={(e) => changePickupDeliveryType(location, CheckboxType.Delivery, j, e.target.value)}
                                      className="w-32 p-2 border border-[#E2E8F0] rounded bg-[#F1F5F9]"
                                      required
                                    >
                                      {DELIVERY_OPTIONS.map((type) => (
                                        <option key={type} value={type}>
                                          {toTitleCase(type)}
                                        </option>
                                      ))}
                                    </select>

                                    <input
                                      id={`deliveryUrl-${j}`}
                                      name={`deliveryUrl-${j}`}
                                      value={deliveryOption.url}
                                      onChange={(e) => changePickupDeliveryUrl(location, CheckboxType.Delivery, j, e.target.value)}
                                      className="flex-1 p-2 border border-gray-300 rounded"
                                    />

                                    <Button
                                      type="button"
                                      onClick={() => removePickupDelivery(location, CheckboxType.Delivery, j)}
                                      variant="ghost"
                                      className=''
                                    >
                                      <Trash2 />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                            </div>
                            <Button
                              className='mt-4'
                              type='button'
                              onClick={() => addPickupDelivery(location, CheckboxType.Delivery)}
                            >
                              <Plus size={16} color="white" className="mr-2"/> 
                              Add Delivery Option
                            </Button>
                          </Card>

                        }
                      </Card>

                      <Card className='p-4 mt-4 overflow-auto'>
                        <CardTitle className='mb-4'>
                          Review Options
                        </CardTitle>

                        <div className='w-full flex flex-col'>
                          {location.reviewOptions?.length > 0 &&
                            <div className='flex mt-4 w-8 mb-2'>
                              <p className='font-medium '>Type</p>
                              <p className='ml-[106px] font-medium'>URL</p>
                            </div>
                          }

                          <div className='w-full'>
                            {location.reviewOptions?.map((reviewOption, j) => (
                              <div key={j} className="flex items-center gap-4 mb-4">
                                <select
                                  id={`reviewOption${toTitleCase(location.name)}${j}`}
                                  name={`reviewOption${toTitleCase(location.name)}${j}`}
                                  value={reviewOption.type}
                                  onChange={(e) => changeReviewOptionType(location, j, e.target.value)}
                                  className="w-32 p-2 border border-[#E2E8F0] rounded bg-[#F1F5F9]"
                                  required
                                >
                                  {REVIEW_OPTIONS.map((type) => (
                                    <option key={type} value={type}>
                                      {toTitleCase(type)}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  id={`reviewOptionUrl-${j}`}
                                  name={`reviewOptionUrl-${j}`}
                                  value={reviewOption.url}
                                  onChange={(e) => changeReviewOptionUrl(location, j, e.target.value)}
                                  className="flex-1 p-2 border border-gray-300 rounded"
                                />

                                <Button
                                  type="button"
                                  onClick={() => removeReviewOption(location, j)}
                                  variant="ghost"
                                  className=''
                                >
                                  <Trash2 />
                                </Button>
                              </div>
                            ))}
                          </div>

                        </div>
                        <Button
                          className='mt-4'
                          type='button'
                          onClick={() => addReviewOption(location)}
                        >
                          <Plus size={16} color="white" className="mr-2"/> 
                          Add Review Option
                        </Button>
                      </Card>

                    </Card>

                  ))}
                </div>

              </form>
            </div>
          </Card>
        </>
      }
    </div>
  )
}

export default Restaurant