import Image from 'next/image'

export default function Loading() {
    return (
        <div className="h-screen w-screen absolute inset-0 flex items-center justify-center bg-white">
            <Image src='/logo.jpg' alt='logo' width={200} height={200} className='animate-pulse'/>
        </div>
    )
}
    