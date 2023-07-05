import useAuth from '@/hooks/useAuth'
import { Card, CardContent, CardTitle } from './ui/card'

import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { signOutUser } from '@/firebase/auth';

const NewAccount = () => {
  console.log("NEW ACCOUNT")
  const auth = useAuth();
  return (
    <main className="flex flex-col justify-between p-2 sm:p-4 md:p-8 lg:p-12 min-w-screen h-screen">
      <Card className=''>
        <div className='p-6 py-4 flex justify-between w-full items-end'>
          <CardTitle className='text-2xl'>
            Welcome
          </CardTitle>
          <Button onClick={signOutUser}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <CardContent>
          <p>
            Hi {auth.user.displayName.split(" ")[0]}! It appears that your restaurant is currently not set up with our system. To proceed further, kindly reach out to us directly at <strong className='hover:underline'><a href='https://hosirestaurants.com'>https://hosirestaurants.com</a></strong>. Your reference ID is  <strong>{auth.user.uid}</strong>.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

export default NewAccount