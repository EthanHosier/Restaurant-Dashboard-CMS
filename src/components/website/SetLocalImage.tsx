"use client"

import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';

const SetLocalImage = ({ localImageSrc, websiteImageSrc, name, handleRestoreImage, setLocalImage, removeLocalImage, cover, imageType, imageIndex }: 
  {
    localImageSrc: string,
    websiteImageSrc: string,
    name: string,
    handleRestoreImage: any,
    setLocalImage: any,
    removeLocalImage: any,
    cover: boolean,
    imageType: any,
    imageIndex: number
  }
  
  ) => {

  const [src, setSrc] = useState("");

  const cropperRef = useRef(null);

  const onCrop = () => {
    if (cropperRef.current) {

      setSrc("")
      //const croppedImg = cropperRef.current.getCanvas()?.toDataURL()

      //setLocalImage(croppedImg, name, imageType, imageIndex)
    }

  };

  const onUploadImage = (e: any) => {
    const file = e.target.files[0];
    //const url = URL.createObjectURL(selectedImage);
    
    if(file /*&& file.type === 'image/avif'*/){
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result;
        setLocalImage(dataURL, name, imageType,imageIndex)
      };

      reader.readAsDataURL(file);
    }

    //setSrc(URL.createObjectURL(selectedImage));
  }


  return (
    <>

      {src &&

        <Card className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 shadow w-2/3 max-h-3/4">
          <button className='absolute rounded-full shadow p-2 bg-white border -mt-2 -ml-2 z-10' onClick={() => setSrc("")} type='button'>
            <X size={18} />
          </button>

          <div className='p-4'>
            {cover ?
              <Cropper
                ref={cropperRef}
                src={src}
                //aspectRatio={1}
                className="cropper"
              />
              :
              <Cropper
                ref={cropperRef}
                src={src}
                className="cropper"
              />
            }



            <div className='w-full flex justify-center mt-8 mb-4'>
              <Button onClick={onCrop} className="text-xl">
                Select
              </Button>
            </div>
          </div>


        </Card>

      }
      <div className='w-48 h-48 border flex items-center justify-center'>
        {localImageSrc != "DELETE" && (localImageSrc || websiteImageSrc)
          ?
          <div className='relative'>
            <button className='absolute rounded-full shadow p-2 bg-white border -mt-2 -ml-2' onClick={() => removeLocalImage(name, imageType, imageIndex)} type='button'>
              <X size={12} />
            </button>
            <img src={(localImageSrc && localImageSrc != "DELETE") ? localImageSrc : websiteImageSrc} className={`w-full extra-images cursor-pointer ${cover ? "object-cover aspect-square" : "object-contain"}`} alt={`${name} image`} />
          </div>
          :
          <div className='relative w-full h-full'>

            {websiteImageSrc && localImageSrc === "DELETE" && (
              <div className='w-48 flex justify-center mt-4'>
                <Button
                  className="text-xs absolute "
                  type="button"
                  variant={"secondary"}
                  onClick={() => handleRestoreImage(name, imageType, imageIndex)}
                >
                  Restore website image
                </Button>
              </div>
            )}

            {/*https://convertio.co/download/63fbbd6e328225c207d765802d992a9c902ef4/ avif files*/}
            <input
              type="file"
              id={name}
              name={name}
              accept={name === "logo" ? "image/*" : "image/avif"}
              onChange={(e) => /*setLocalImage(e, imageType, imageIndex)*/ onUploadImage(e)}
              className="hidden"
              multiple={false}
            />

            <label htmlFor={name} className="cursor-pointer absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Plus size={24} />
            </label>

          </div>
        }
      </div>

    </>
  )
}

export default SetLocalImage