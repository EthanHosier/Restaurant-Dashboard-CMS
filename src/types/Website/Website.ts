import DropdownOption from "./DropdownOption";
import Review from "./Review";
import SocialMediaLink from "./SocialMediaLink";
import Backgrounds from "./Backgrounds";
import Colors from "./Colors";

export default interface Website {
  colors: Colors,
  name: string,
  slogan: string,
  navOptions: DropdownOption[],
  bookUrl: "/book",
  infoTitle: /*h1*/ string,
  infoText: /*p1*/ string,
  reviews: Review[],
  hashtag: string,
  socialMediaLinks: SocialMediaLink[],
  emails: string, /*Get from location data*/
  backgrounds: Backgrounds,
  images: string[],
  logo:string,
  url: string,
  offerGiftCards: boolean,
  giftCardUrl: string,
}