import { login } from "../../firebase/auth";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import { Card } from "@/components/ui/card";

const page = () => {
  return (
    <div className='h-screen w-screen flex items-center justify-center p-2 sm:p-4 md:p-8 lg:p-12"'>
      <Card className="w-full h-full flex items-center justify-center">
        <Button onClick={login}>
          <div className="flex items-center justify-around">
            <p className="text-lg">Login with</p>
            <FcGoogle size={28} className="ml-1" />
          </div>
        </Button>
      </Card>
    </div>
  );
};

export default page;
