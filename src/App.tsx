import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Plus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Loadingpg from "./components/Loadingpg"

import Bookings from "./components/Bookings"
import Customers from './components/Customers'
import useAuth from "./hooks/useAuth"
import { useEffect, useState } from 'react'
import Login from "./components/login/page"
import { signOutUser } from "./firebase/auth"

import { db } from "./firebase/config";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import BookingData from '@/types/BookingData' //the type
import { defaultLocalImages, getDeepCopyOfObject } from '@/lib/utils'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Location from '@/types/Locations'
import Restaurant from '@/components/Restaurant'
import Website from '@/components/Website'
import WebsiteType from '@/types/Website/Website'
import { getDownloadURL, getStorage, ref } from 'firebase/storage'
import ImageObj from "./types/Website/ImageObj"
import UserProfile from '@/types/UserProfile'
import { Toaster } from "@/components/ui/toaster"
import NewAccount from '@/components/NewAccount'
import { Link } from "react-router-dom"

export default function App() {
  const auth = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [locations, setLocations] = useState<Location[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);

  const [websiteData, setWebsiteData] = useState<WebsiteType>()
  const [signedUrls, setSignedUrls] = useState<ImageObj>();

  const [loading, setLoading] = useState<Boolean>(true);
  const [loadingAgain, setLoadingAgain] = useState<Boolean>(true);

  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<string>("bookings")

  const [hasRestaurant, setHasRestaurant] = useState<boolean>();

  useEffect(() => {
    //console.log(auth.user)
    if (!auth.user) {

      if (!auth.loading) {
        setLoadingAgain(false);
        setLoading(false);
      }
      return
    };

    //check if restaurant exists
    getDoc(doc(db, "restaurants", auth.user.uid)).then((doc: any) => {
      if (doc.exists()) setHasRestaurant(true);
      setLoadingAgain(false);
    })

    const unsubscribeLocationData = onSnapshot(collection(db, "restaurants", auth.user.uid, "locations"), (snapshot) => {
      if (snapshot.empty) {
        //router.push('/createRestaurant');
      } else {
        let resLocations: Location[] = [];

        snapshot.forEach((doc: any) => {
          const {
            address,
            location,
            maxStayDuration,
            name,
            openingTimes,
            tables,
            contactNumber,
            contactEmail,
            restaurantId,
            locationId,
            delivery,
            pickup,
            deliveryOptions,
            pickupOptions,
            reviewOptions,
          } = doc.data();

          //could just make ll = doc.data()???
          //idk might make changes in future

          const ll: Location = {
            restaurantId,
            locationId,
            address,
            location,
            maxStayDuration,
            name,
            openingTimes,
            tables,
            contactNumber,
            contactEmail,
            delivery,
            pickup,
            deliveryOptions,
            pickupOptions,
            reviewOptions: reviewOptions ?? [],
          };

          resLocations.push(ll);
        });

        setLocations(resLocations);

      }
    });


    let unsubBookingData: any = null;

    //DOES THIS ONLY LISTEN TO NEW BOOKINGS (NOT CHANGES WITHIN THOSE BOOKINGS)??
    //if i read the docs correct it should but oh well funny
    const q = query(collection(db, "bookings"), where("restaurantId", "==", auth.user.uid));
    unsubBookingData = onSnapshot(q, (querySnapshot) => {
      console.log(auth.user.uid)
      let dbBookings: BookingData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const {
          comments,
          allocatedTables,
          email,
          endDateTime,
          firstName,
          locationId,
          mobileNumber,
          partySize,
          restaurantId,
          startDateTime,
          surname,
          sentReview,
          restaurantTitle,
          location,
          messageId
        } = data;



        dbBookings.push(
          {
            id: doc.id,
            allocatedTables,
            comments,
            email,
            firstName,
            locationId,
            mobileNumber,
            partySize,
            restaurantId,
            surname,
            startDateTime: new Date(startDateTime.toDate()),
            endDateTime: new Date(endDateTime.toDate()),
            sentReview,
            restaurantTitle,
            location,
            messageId
          });
      });
      setBookings(dbBookings);
    }, console.error);


    const websiteDocRef = doc(db, "websites", auth.user.uid);

    const unsubWebsiteData = onSnapshot(websiteDocRef, { includeMetadataChanges: true }, async (snapshot) => {

      if (!snapshot.exists()) return;

      const w = snapshot.data() as WebsiteType;

      setWebsiteData(w);

      const storage = getStorage();

      const su: ImageObj = getDeepCopyOfObject(defaultLocalImages);

      if (w.logo) {
        const url = await getDownloadURL(ref(storage, w.logo))
        su.logo = url
      }

      await Promise.all(w.images.map(async (img, i) => {
        if (img) {
          const url = await getDownloadURL(ref(storage, img));
          su.images[i] = url;
        } else {
          su.images[i] = "";
        }
      }));



      await Promise.all(Object.keys(w.backgrounds).map(async (k) => {
        let key = k as keyof typeof w.backgrounds;

        if (w.backgrounds[key]) {
          const url = await getDownloadURL(ref(storage, w.backgrounds[key]));
          su.backgrounds[key] = url;
        }
      }));

      setSignedUrls(su);
    })

    const unsubUserProfiles = onSnapshot(collection(db, "restaurants", auth.user.uid, "userProfiles"), (snapshot) => {
      let profiles: UserProfile[] = [];
      if (snapshot.empty) {
        //dick
      } else {
        snapshot.forEach((doc: any) => {
          const { notes } = doc.data();
          const id = doc.id;

          profiles.push({ id, notes });
        })
      }

      setUserProfiles(profiles);
    })



    setLoading(false);

    return () => {
      unsubscribeLocationData();
      unsubBookingData();
      unsubWebsiteData();
      unsubUserProfiles();
    };
  }, [auth.user, auth]) //bruh idk


  //hacky but oh well
  return auth.loading || loading || loadingAgain ? (<Loadingpg />) :
    !auth.user ? <Login /> :
      !hasRestaurant ? <NewAccount /> :
        (
          <main className="flex flex-col justify-between p-2 sm:p-4 md:p-8 lg:p-12 min-w-screen">
            <Card className='overflow-auto'>
              <CardHeader>
                <CardTitle>
                  <div className="flex justify-between items-center">
                    <h1 className='text-3xl font-bold'>Dashboard</h1>
                    <Button onClick={signOutUser}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="bookings" className="w-full" onValueChange={setSelectedTab}>

                  <div className='flex justify-between flex-col sm:flex-row'>
                    <TabsList className='w-[343px]'>
                      <TabsTrigger value="bookings">Bookings</TabsTrigger>
                      <TabsTrigger value="customers">Customers</TabsTrigger>
                      <TabsTrigger value="venues">Venues</TabsTrigger>
                      <TabsTrigger value="website">Website</TabsTrigger>
                    </TabsList>

                    <div className="flex justify-between flex-1 mt-4 sm:mt-0 sm:justify-end">
                      <Select onValueChange={setSelectedLocation}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {
                            locations.map((l, i) => (
                              <SelectItem key={i} value={l.locationId} onClick={(e) => console.log(e)}>{l.name}, {l.location}</SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>

                      {
                        selectedTab === "bookings" &&
                        <Link to={`https://d303vz01x9nm1g.cloudfront.net?restaurantId=${auth.user.uid}`} target={"_blank"} className='inline-flex items-center justify-center rounded-md text-xs  font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 -mb-4 w-36 ml-4 sm:hidden'>
                          <div className='flex items-center'>
                            <Plus size={16} color="white" /><p className='ml-1'>New Booking</p>
                          </div>
                        </Link>
                      }

                    </div>
                  </div>


                  <TabsContent value="bookings"><Bookings bookings={bookings} selectedLocation={selectedLocation} userProfiles={userProfiles} /></TabsContent>
                  <TabsContent value="customers"><Customers bookings={bookings} selectedLocation={selectedLocation} allLocations={locations} userProfiles={userProfiles} websiteUrl={websiteData?.url ?? ""} /></TabsContent>
                  <TabsContent value="venues"><Restaurant bookings={bookings} locations={locations} /></TabsContent>
                  <TabsContent value="website"><Website storedWebsite={websiteData} signedUrls={signedUrls} /></TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Toaster />
          </main>
        )

}