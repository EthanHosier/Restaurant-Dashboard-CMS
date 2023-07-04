import { Plus, X } from "lucide-react"

const SetMenu = ({ src, index, setMenu, removeMenuUrl }: { src: string, index: number, setMenu: any, removeMenuUrl: any }) => {



  const handleUpload = (e: any) => {
    const file = e.target.files[0];

    if (file /*&& file.type === 'image/avif'*/) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataURL = reader.result;
        setMenu(dataURL, index)
      };

      reader.readAsDataURL(file);
    }
  }

  return (
    <div className='w-48 h-48 border flex items-center justify-center relative mt-4 '>

      {
        src ?
          <>
            <button className='absolute rounded-full shadow p-2 bg-white border -mt-44 -ml-44' onClick={() => removeMenuUrl(index)} type='button'>
              <X size={12} />
            </button>
            <p>No preview available</p>
          </>

          :
          <>
            <input
              type="file"
              id={`menu-${index}`}
              name={`menu-${index}`}
              accept=".pdf, .doc, .docx, .jpg, .jpeg, .png, .avif, .webp"
              onChange={handleUpload}
              className="hidden"
              multiple={false}
            />

            <label htmlFor={`menu-${index}`} className="cursor-pointer absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Plus size={24} />
            </label>
          </>
      }


    </div>

  )
}

export default SetMenu