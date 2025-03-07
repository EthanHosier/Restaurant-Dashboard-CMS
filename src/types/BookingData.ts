export default interface BookingData {
  id: string;
  allocatedTables: number[];
  comments: string;
  email: string;
  mobileNumber: string;
  startDateTime: Date;
  endDateTime: Date;
  restaurantId: string;
  locationId: string;
  firstName: string;
  surname: string;
  partySize: number;
  sentReview: boolean;
  restaurantTitle: string;
  location: string;
  messageId: string;
}
