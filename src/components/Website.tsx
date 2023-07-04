import type WebsiteType from '@/types/Website/Website';
import { useEffect, useState } from 'react'
import { Card, CardTitle } from './ui/card';
import { Button } from './ui/button';
import SetLocalImage from "./website/SetLocalImage"
import { isBinaryImage, toBlob, toTitleCase, defaultLocalImages } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Loader2, Save, Info } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import useAuth from '@/hooks/useAuth';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import ImageObj from "../types/Website/ImageObj";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from './ui/checkbox';

const emptyWebsite: WebsiteType = {
  colors: {
    primaryBgCol: "#ffffff",
    secondaryBgCol: "#222222",
    tertiaryBgCol: "#D74B15",
    primaryTextCol: "#090721",
    secondaryTextCol: "#F3F4EF",
    tertiaryTextCol: "#F3F4EF",
  },
  name: '',
  logo: '',
  slogan: '',
  navOptions: [],
  bookUrl: '/book',
  infoTitle: '',
  infoText: '',
  reviews: [
    {
      source: "tripadvisor",
      text: "",
      link: "",
    },
    {
      source: "google",
      text: "",
      link: "",
    },
    {
      source: "yelp",
      text: "",
      link: "",
    }
  ],
  hashtag: '',
  socialMediaLinks: [],
  emails: '',
  backgrounds: {
    logoSection: "",
    pickupDeliverySection: "",
    sloganSection: "",
    connectWithUs: "",
    pickup: "",
    delivery: "",
    contactUs: "",
  },
  images: ["", "", "", "", "", ""],
  url: "",
  offerGiftCards: false,
  giftCardUrl: "",
}

const COLOR_NAME_MAP = {
  primaryBgCol: "Primary Background Colour",
  secondaryBgCol: "Secondary Background Colour",
  tertiaryBgCol: "Accent Background Color",

  primaryTextCol: "Primary Text Color",
  secondaryTextCol: "Secondary Text Color",
  tertiaryTextCol: "Accent Text Colour",
}

enum ImageType {
  Background,
  Image,
  Normal,
}

const REVIEW_SOURCES = ["google", "yelp", "tripadvisor"]
const SM_TYPES = ["instagram", "facebook", "twitter", "tiktok"]

const Website = ({ storedWebsite, signedUrls }: { storedWebsite: WebsiteType | undefined, signedUrls: ImageObj | undefined }) => {
  const [websiteData, setWebsiteData] = useState<WebsiteType>(storedWebsite ?? emptyWebsite);
  const [localUploadTemporaryImages, setLocalUploadTemporaryImages] = useState({ logo: defaultLocalImages.logo, backgrounds: { ...defaultLocalImages.backgrounds }, images: [...defaultLocalImages.images] });

  const [canSave, setCanSave] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false); //am i still gonna use this here??
  const [error, setError] = useState<string>("");


  useEffect(() => {
    if (!storedWebsite) return;
    setWebsiteData(storedWebsite);
  }, [storedWebsite])

  const enableSaving = () => setCanSave(true);

  const auth = useAuth();

  const handleSubmit = async (e: any) => {
    e.preventDefault();


    setSaveLoading(true);

    let upload = { ...websiteData };

    //the text of upload is correct, now must just change the images

    //Images##########
    const storage = getStorage();

    let promises = [];

    //logo
    if (isBinaryImage(localUploadTemporaryImages.logo)) { // so locally changed
      const location = `${auth.user.uid}/logo`;
      const logoRef = ref(storage, location);

      const blob = toBlob(localUploadTemporaryImages.logo, "png"); //LOGO IS PNG
      promises.push(uploadBytes(logoRef, blob));

      upload.logo = location;

    } else if (localUploadTemporaryImages.logo === "DELETE") {
      upload.logo = "";
    }


    //backgrounds
    Object.keys(localUploadTemporaryImages.backgrounds).map((k) => {
      let key = k as keyof typeof localUploadTemporaryImages.backgrounds;
      let key_ = k as keyof typeof upload.backgrounds;


      if (isBinaryImage(localUploadTemporaryImages.backgrounds[key])) {
        const location = `${auth.user.uid}/backgrounds/${key}`;
        const bgRef = ref(storage, location);

        const blob = toBlob(localUploadTemporaryImages.backgrounds[key], "avif");
        promises.push(uploadBytes(bgRef, blob));


        upload.backgrounds[key_] = location;

      } else if (localUploadTemporaryImages.backgrounds[key] === "DELETE") {
        upload.backgrounds[key_] = ""
      }
    })



    //images
    localUploadTemporaryImages.images.forEach((img, i) => {
      if (isBinaryImage(img)) {
        const location = `${auth.user.uid}/images/${i}`;
        const imgRef = ref(storage, location);

        const blob = toBlob(img, "avif");
        promises.push(uploadBytes(imgRef, blob));


        upload.images[i] = location;

      } else if (img === "DELETE") {
        upload.images[i] = "";
      } else {
        upload.images[i] = websiteData.images[i];
      }

    })

    //try upload the images
    try {
      await Promise.all(promises);
    } catch (error: any) {
      setError(error.message);
      console.log(`Error uploading images: ${error}`);
    }

    //##############
    try {
      const websiteDocRef = doc(db, "websites", auth.user.uid);
      console.log({ upload })
      setDoc(websiteDocRef, upload);
    } catch (error: any) {
      console.log(error)
      setError(error.message);
    }

    //reset localUpload temporary images:
    setLocalUploadTemporaryImages({ ...defaultLocalImages });

    //setWebsiteData(copyOfWebsiteData);

    setSaveLoading(false);
    setCanSave(false);

  }


  //////////////////////////////////////////////////

  const setLocalImage = (url: string, name: string, imageType: ImageType, imageIndex: number) => {

    const tempLocalImages = { logo: localUploadTemporaryImages.logo, backgrounds: { ...localUploadTemporaryImages.backgrounds }, images: [...localUploadTemporaryImages.images] }

    switch (imageType) {
      case ImageType.Background:
        let name_ = name as keyof typeof tempLocalImages.backgrounds;
        tempLocalImages.backgrounds[name_] = url ?? ""
        break;
      case ImageType.Normal:
        tempLocalImages["logo"] = url ?? "";
        break;
      case ImageType.Image:
        tempLocalImages.images[imageIndex] = url ?? "";
        break;
    }

    setLocalUploadTemporaryImages({ ...tempLocalImages });
    enableSaving();
  }

  const handleRemoveLocalImage = (name: string, imageType: ImageType, imageIndex: number) => {
    const tempLocalImages = { logo: localUploadTemporaryImages.logo, backgrounds: { ...localUploadTemporaryImages.backgrounds }, images: [...localUploadTemporaryImages.images] }

    switch (imageType) {
      case ImageType.Background:
        let name_ = name as keyof typeof tempLocalImages.backgrounds;
        tempLocalImages.backgrounds[name_] = "DELETE";
        break;

      case ImageType.Normal:
        tempLocalImages["logo"] = "DELETE";
        break;

      case ImageType.Image: {
        tempLocalImages.images[imageIndex] = "DELETE";
        break;
      }
    }


    setLocalUploadTemporaryImages({ ...tempLocalImages });
    enableSaving();

  }

  const handleRestoreWebsiteImage = (name: string, imageType: ImageType, imageIndex: number) => {
    const tempLocalImages = { logo: localUploadTemporaryImages.logo, backgrounds: { ...localUploadTemporaryImages.backgrounds }, images: [...localUploadTemporaryImages.images] }


    switch (imageType) {
      case ImageType.Background:
        let name_ = name as keyof typeof tempLocalImages.backgrounds;
        tempLocalImages.backgrounds[name_] = "";
        break;

      case ImageType.Normal:
        tempLocalImages["logo"] = "";
        break;

      case ImageType.Image: {
        tempLocalImages.images[imageIndex] = "";
        break;
      }
    }


    setLocalUploadTemporaryImages({ ...tempLocalImages });
    enableSaving();
  }



  const handleTextChange = (e: any) => { //maybe pass key (name) and value in here directly?
    const temporaryWebsiteData = { ...websiteData };
    let key = e.target.name as keyof typeof temporaryWebsiteData;
    temporaryWebsiteData[key] = e.target.value;
    setWebsiteData({ ...temporaryWebsiteData })
    enableSaving();
  }

  const handleReviewTextChange = (text: string, index: number) => {
    const temporaryWebsiteData = { ...websiteData };
    temporaryWebsiteData.reviews[index].text = text;
    setWebsiteData({ ...temporaryWebsiteData });
    enableSaving();

  }

  const handleReviewUrlChange = (text: string, index: number) => {
    const temporaryWebsiteData = { ...websiteData };
    temporaryWebsiteData.reviews[index].link = text;
    setWebsiteData({ ...temporaryWebsiteData });
    enableSaving();

  }

  const handleReviewSourceChange = (source: string, index: number) => {
    const temporaryWebsiteData = { ...websiteData };
    temporaryWebsiteData.reviews[index].source = source;
    setWebsiteData({ ...temporaryWebsiteData });
    enableSaving();

  }

  //social media links:
  const addSocialMediaLink = () => {
    const uuid: string = uuidv4();

    const temporaryWebsiteData = { ...websiteData };
    temporaryWebsiteData.socialMediaLinks.push({ id: uuid, type: "instagram", url: "" })
    setWebsiteData({ ...temporaryWebsiteData });
    enableSaving();

  }

  const handleRemoveSocialMediaLink = (id: string) => {
    const temporaryWebsiteData = { ...websiteData };
    let index = temporaryWebsiteData.socialMediaLinks.findIndex(obj => obj.id = id);
    if (index !== -1) {
      temporaryWebsiteData.socialMediaLinks.splice(index, 1);
    }
    setWebsiteData({ ...temporaryWebsiteData });
    enableSaving();

  };

  const handleSocialMediaTypeChange = (id: string, type: string) => {
    const temporaryWebsiteData = { ...websiteData };
    let index = temporaryWebsiteData.socialMediaLinks.findIndex(obj => obj.id === id);
    if (index !== -1) {
      temporaryWebsiteData.socialMediaLinks[index].type = type;
    }
    setWebsiteData({ ...temporaryWebsiteData });
    enableSaving();

  };

  const handleSocialMediaUrlChange = (id: string, url: string) => {
    const temporaryWebsiteData = { ...websiteData };
    let index = temporaryWebsiteData.socialMediaLinks.findIndex(obj => obj.id === id);
    if (index !== -1) {
      temporaryWebsiteData.socialMediaLinks[index].url = url;
    }
    setWebsiteData({ ...temporaryWebsiteData });
    enableSaving();

  };



  const handleColChange = (type: string, col: string) => {
    const copyOfWebsiteData = { ...websiteData };
    let t = type as keyof typeof copyOfWebsiteData.colors;
    copyOfWebsiteData.colors[t] = col;
    setWebsiteData({ ...copyOfWebsiteData });
    enableSaving();
  }

  const toggleOfferGiftCards = () => {
    const copyOfWebsiteData = { ...websiteData };
    copyOfWebsiteData.offerGiftCards = !copyOfWebsiteData.offerGiftCards;
    setWebsiteData({ ...copyOfWebsiteData });
    enableSaving();
  }

  const handleGiftCardUrlChange = (url: string) => {
    const copyOfWebsiteData = { ...websiteData };
    copyOfWebsiteData.giftCardUrl = url;
    setWebsiteData({ ...copyOfWebsiteData });
    enableSaving();
  }

  return (
    <div className='flex flex-col items-start'>
      {error && <p className='text-red-600'>Please contact support. Error: {error}</p>}


      <form className="w-full mx-auto mt-4" onSubmit={handleSubmit}>
        <Button
          disabled={saveLoading || !canSave}
          className={`${!canSave ? "bg-[#E4EAF1]" : "bg-green-600"} hover:bg-green-500 fixed bottom-6 right-6 p-6`}
          type='submit'
        >
          {saveLoading ? <Loader2 className='animate-spin' size={20} /> : <Save size={20} color="white" />}
          <p className='ml-2 text-xl'>Save</p>
        </Button>


        <Card className='p-4 bg-[#F1F5F9]'>

          <Card className="p-4 mb-4">
            <CardTitle>Common Questions</CardTitle>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Why isn't my website updating?</AccordionTrigger>
                <AccordionContent>
                  For faster load times and SEO, websites are cached every 3 hours. This means it
                  may take up to 3 hours for your website changes to take effect. If there is a serious
                  issue which must be resolved immediately, please contact us directly so that we can
                  fix this for you.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </Card>


          <Card className="p-4 mb-4">

            <CardTitle>General</CardTitle>
            <div className="my-4">
              <>
                <label htmlFor="location" className="block font-medium mb-1">
                  URL
                </label>
                <input
                  type="text"
                  id="url"
                  name="url"
                  value={websiteData.url}
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  disabled
                />

                {Object.keys(COLOR_NAME_MAP).map((key, i) => {

                  return (
                    <div key={i} className={`${i == 3 && "mt-4"}`}>
                      <label htmlFor={key} className="block font-medium mb-2">
                        {COLOR_NAME_MAP[key as keyof typeof COLOR_NAME_MAP]}
                      </label>
                      <input
                        type="color"
                        id={key}
                        name={key}
                        value={websiteData.colors[key as keyof typeof COLOR_NAME_MAP] ?? "#ffffff"}
                        onChange={(event) => handleColChange(key, event.target.value)}
                        className="mb-8"
                      />
                    </div>
                  )
                })}

                <label className="block font-medium mb-2">
                  Logo
                </label>
                <SetLocalImage
                  websiteImageSrc={signedUrls ? signedUrls.logo : defaultLocalImages.logo}
                  localImageSrc={localUploadTemporaryImages.logo}
                  name={"logo"}
                  setLocalImage={setLocalImage}
                  handleRestoreImage={handleRestoreWebsiteImage}
                  removeLocalImage={handleRemoveLocalImage}
                  cover={false}
                  imageType={ImageType.Normal}
                  imageIndex={-1}
                />
              </>
            </div>
          </Card>

          <Card className='mb-4 p-4'>
            <CardTitle>Gift Cards</CardTitle>

            <div className='flex items-center my-2 mt-4'>
              <p className='mr-2'>Offer gift cards:</p>
              <Checkbox
                checked={websiteData.offerGiftCards ?? false}
                onClick={toggleOfferGiftCards}
              />
            </div>

            {websiteData.offerGiftCards &&
              <div className='flex items-center'>
                <p className='font-semibold mr-2'>URL</p>
                <input
                  type="text"
                  id="url"
                  name="url"
                  value={websiteData.giftCardUrl}
                  onChange={(e) => handleGiftCardUrlChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

            }


          </Card>

          <Card className='p-4 mb-4'>
            <div className='flex items-center'>
              <Info size={40} />
              <p className='ml-4'>Only .avif images may be uploaded for the following images. To convert your images to .avif files, please use this free converter: <a href="https://convertio.co/jpg-avif/" className='hover:underline font-semibold'>https://convertio.co/jpg-avif/</a></p>
            </div>
          </Card>

          <Card className='p-4 mb-4'>
            <CardTitle>Logo Section</CardTitle>

            <div className="my-4">
              <label className="block font-medium mb-2">
                Background
              </label>
              <SetLocalImage
                websiteImageSrc={signedUrls ? signedUrls.backgrounds.logoSection : defaultLocalImages.backgrounds.logoSection}
                localImageSrc={localUploadTemporaryImages.backgrounds.logoSection}
                name={"logoSection"}
                setLocalImage={setLocalImage}
                handleRestoreImage={handleRestoreWebsiteImage}
                removeLocalImage={handleRemoveLocalImage}
                cover={false}
                imageType={ImageType.Background}
                imageIndex={-1}
              />
            </div>
          </Card>

          <Card className='p-4 mb-4'>
            <CardTitle>Restaurant Info</CardTitle>
            <div className="my-4">
              <label htmlFor="restaurantName" className="block font-medium mb-1">
                Info Title
              </label>
              <textarea
                id="infoTitle"
                name="infoTitle"
                value={websiteData.infoTitle}
                onChange={handleTextChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="my-4">
              <label htmlFor="restaurantInfo" className="block font-medium mb-1">
                Info text
              </label>
              <textarea
                id="infoText"
                name="infoText"
                value={websiteData.infoText}
                onChange={handleTextChange}
                className="w-full p-2 border border-gray-300 rounded h-24"
                required
              />
            </div>
          </Card>

          <Card className='p-4 mb-4'>
            <CardTitle>Pickup & Delivery</CardTitle>

            <label htmlFor="restaurantInfo" className="block font-medium mb-1 mt-4">
              Homescreen Pickup & Delivery Background
            </label>
            <SetLocalImage
              websiteImageSrc={signedUrls ? signedUrls.backgrounds.pickupDeliverySection : defaultLocalImages.backgrounds.pickupDeliverySection}
              localImageSrc={localUploadTemporaryImages.backgrounds.pickupDeliverySection}
              name={`pickupDeliverySection`}
              setLocalImage={setLocalImage}
              handleRestoreImage={handleRestoreWebsiteImage}
              removeLocalImage={handleRemoveLocalImage}
              cover={false}
              imageType={ImageType.Background}
              imageIndex={-1}
            />

            <label htmlFor="restaurantInfo" className="block font-medium mb-1 mt-4">
              Pickup Page Background
            </label>
            <SetLocalImage
              websiteImageSrc={signedUrls ? signedUrls.backgrounds.pickup : defaultLocalImages.backgrounds.pickup}
              localImageSrc={localUploadTemporaryImages.backgrounds.pickup}
              name={`pickup`}
              setLocalImage={setLocalImage}
              handleRestoreImage={handleRestoreWebsiteImage}
              removeLocalImage={handleRemoveLocalImage}
              cover={false}
              imageType={ImageType.Background}
              imageIndex={-1}
            />

            <label htmlFor="restaurantInfo" className="block font-medium mb-1 mt-4">
              Delivery Page Background
            </label>
            <SetLocalImage
              websiteImageSrc={signedUrls ? signedUrls.backgrounds.delivery : defaultLocalImages.backgrounds.delivery}
              localImageSrc={localUploadTemporaryImages.backgrounds.delivery}
              name={`delivery`}
              setLocalImage={setLocalImage}
              handleRestoreImage={handleRestoreWebsiteImage}
              removeLocalImage={handleRemoveLocalImage}
              cover={false}
              imageType={ImageType.Background}
              imageIndex={-1}
            />

          </Card>

          <Card className='p-4 mb-4'>
            <CardTitle>Reviews</CardTitle>
            {websiteData.reviews.map((_, i) => (
              <Card className='my-4 p-4' key={i}>
                <label className="block font-medium mb-1">
                  Source
                </label>
                <select
                  id={`reviewSource${i}`}
                  name={`reviewSource${i}`}
                  value={websiteData.reviews[i].source}
                  onChange={(e) => { handleReviewSourceChange(e.target.value, i) }}
                  className="w-32 p-2 border border-[#E2E8F0] rounded bg-[#F1F5F9]"
                  required
                >
                  {REVIEW_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {toTitleCase(source)}
                    </option>
                  ))}
                </select>


                <label htmlFor="restaurantInfo" className="block font-medium mb-1 mt-4">
                  Review
                </label>
                <textarea
                  id="infoText"
                  name="infoText"
                  value={websiteData.reviews[i].text}
                  onChange={(e) => handleReviewTextChange(e.target.value, i)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />

                <label htmlFor="restaurantInfo" className="block font-medium mb-1 mt-4">
                  Url
                </label>
                <input
                  type="text"
                  id={`reviewURL${i}`}
                  name={`reviewURL${i}`}
                  value={websiteData.reviews[i].link}
                  onChange={(e) => handleReviewUrlChange(e.target.value, i)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </Card>
            ))}
          </Card>

          <Card className='p-4 mb-4'>
            <CardTitle>Slogan Section</CardTitle>
            <div className="my-4">
              <label htmlFor="restaurantName" className="block font-medium mb-1">
                Slogan
              </label>
              <input
                type="text"
                id="slogan"
                name="slogan"
                value={websiteData.slogan}
                onChange={handleTextChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>

            <label htmlFor="restaurantName" className="block font-medium mb-1">
              Background
            </label>
            <SetLocalImage
              websiteImageSrc={signedUrls ? signedUrls.backgrounds.sloganSection : defaultLocalImages.backgrounds.sloganSection}
              localImageSrc={localUploadTemporaryImages.backgrounds.sloganSection}
              name={`sloganSection`}
              setLocalImage={setLocalImage}
              handleRestoreImage={handleRestoreWebsiteImage}
              removeLocalImage={handleRemoveLocalImage}
              cover={false}
              imageType={ImageType.Background}
              imageIndex={-1}
            />
          </Card>

          <Card className='p-4 mb-4'>
            <CardTitle>Images Section</CardTitle>

            <div className='my-4 flex flex-wrap gap-4'>
              {[... new Array(6)].map((_, i) => (
                <SetLocalImage
                  key={i}
                  websiteImageSrc={signedUrls ? signedUrls.images[i] : defaultLocalImages.images[i]}
                  localImageSrc={localUploadTemporaryImages.images[i]}
                  name={`image${i}`}
                  setLocalImage={setLocalImage}
                  handleRestoreImage={handleRestoreWebsiteImage}
                  removeLocalImage={handleRemoveLocalImage}
                  cover={true}
                  imageType={ImageType.Image}
                  imageIndex={i}
                />
              ))}
            </div>



          </Card>

          <Card className='p-4 mb-4 overflow-auto'>
            <CardTitle>Connect With Us (Social Media Links)</CardTitle>

            <label className="block font-medium mb-2 mt-4">
              Background
            </label>
            <SetLocalImage
              websiteImageSrc={signedUrls ? signedUrls.backgrounds.connectWithUs : defaultLocalImages.backgrounds.connectWithUs}
              localImageSrc={localUploadTemporaryImages.backgrounds.connectWithUs}
              name={`connectWithUs`}
              setLocalImage={setLocalImage}
              handleRestoreImage={handleRestoreWebsiteImage}
              removeLocalImage={handleRemoveLocalImage}
              cover={false}
              imageType={ImageType.Background}
              imageIndex={-1}
            />

            <div className='w-full flex flex-col'>
              {websiteData.socialMediaLinks.length > 0 &&
                <div className='flex mt-4 w-8 mb-2'>
                  <p className='font-medium '>Type</p>
                  <p className='ml-[106px] font-medium'>URL</p>
                </div>
              }

              <div className='w-full'>
                {websiteData.socialMediaLinks.map((smLink, j) => (
                  <div key={j} className="flex items-center gap-4 mb-4">
                    <select
                      id={`smType${j}`}
                      name={`smType${j}`}
                      value={websiteData.socialMediaLinks[j].type}
                      onChange={(e) => handleSocialMediaTypeChange(smLink.id, e.target.value)}
                      className="w-32 p-2 border border-[#E2E8F0] rounded bg-[#F1F5F9]"
                      required
                    >
                      {SM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {toTitleCase(type)}
                        </option>
                      ))}
                    </select>

                    <input
                      id={`link-${j}`}
                      name={`link-${j}`}
                      value={smLink.url}
                      onChange={(e) => handleSocialMediaUrlChange(smLink.id, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded"
                    />

                    <Button
                      type="button"
                      onClick={() => handleRemoveSocialMediaLink(smLink.id)}
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
              onClick={addSocialMediaLink}
            >
              Add Social Media
            </Button>


          </Card>

          <Card className='p-4 mb-4'>
            <CardTitle className='mb-4'>Contact Us</CardTitle>
            <label className="block font-medium mb-2">
              Background
            </label>
            <SetLocalImage
              websiteImageSrc={signedUrls ? signedUrls.backgrounds.contactUs : defaultLocalImages.backgrounds.contactUs}
              localImageSrc={localUploadTemporaryImages.backgrounds.contactUs}
              name={`contactUs`}
              setLocalImage={setLocalImage}
              handleRestoreImage={handleRestoreWebsiteImage}
              removeLocalImage={handleRemoveLocalImage}
              cover={false}
              imageType={ImageType.Background}
              imageIndex={-1}
            />

          </Card>

          <Card className='p-4 mb-4'>
            <CardTitle>Footer</CardTitle>
            <div className="my-4">
              <label htmlFor="restaurantName" className="block font-medium mb-1">
                Hashtag
              </label>

              <div className='flex items-center'>
                <p className='mr-2 text-lg'>#</p>
                <input
                  type="text"
                  id="hashtag"
                  name="hashtag"
                  value={websiteData.hashtag}
                  onChange={handleTextChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

            </div>
          </Card>


        </Card>

      </form>


    </div>

  )
}

export default Website