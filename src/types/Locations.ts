import OpeningTimes from "./OpeningTimes";
import PickupDeliveryOption from "./PickupDeliveryOption";
import Table from "./Table";
import ReviewOption from "./ReviewOption";

export default interface Location {
  locationId: string,
  restaurantId:string,
  address: string,
  location: string,
  maxStayDuration: number,
  name: string,
  openingTimes: OpeningTimes,
  tables: Table[],
  contactNumber: string,
  contactEmail: string,
  pickup: boolean,
  delivery: boolean,
  pickupOptions: PickupDeliveryOption[],
  deliveryOptions: PickupDeliveryOption[],
  reviewOptions: ReviewOption[],
}