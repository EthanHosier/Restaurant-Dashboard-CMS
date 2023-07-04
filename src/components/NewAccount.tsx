import useAuth from '@/hooks/useAuth'
import { Card, CardContent, CardTitle } from './ui/card'

const NewAccount = () => {

  const auth = useAuth();
  return (
    <main className="flex flex-col justify-between p-2 sm:p-4 md:p-8 lg:p-12 min-w-screen h-screen">
      <Card className=''>
        <CardTitle className='p-4 text-2xl'>
          Welcome
        </CardTitle>
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