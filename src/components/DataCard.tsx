import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const DataCard = ({ title, value, comment, icon }: { title: string, value: number, comment: string, icon: JSX.Element }) => {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm font-semibold'>
          <div className='flex justify-between'>
            <p>{title}</p>
            {icon}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-2xl -mt-5 font-bold'>{value}</p>
        <p className='text-muted-foreground text-sm'>{comment}</p>
      </CardContent>
    </Card>
  )
}

export default DataCard;