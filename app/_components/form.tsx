// 'use client'

// import { PostProcessingStatus } from '@/lib/constants'
// import { ErrorCode, getError } from '@/lib/error'
// import Image from 'next/image'
// import { useActionState, useCallback, useMemo } from 'react'
// import { toast } from 'sonner'
// import { v4 as uuidv4 } from 'uuid'
// import { Cooper } from '../icons/cooper'
// import Download from '../icons/download'
// import Easel from '../icons/easel'
// import { Louie } from '../icons/louie'
// import SadBunny from '../icons/sad-bunny'
// import { PixelApiResponse } from '../pixel-api/types'
// import { usePixelsInfinite } from '../swr/use-pixels'
// import { cn } from '../utils/classnames'
// import { usePixelStatus } from '../utils/use-pixel-status'
// import { Button, ButtonLink } from './button'
// import { SimpleContainer } from './container/simple'
// import { FormState, generateIcon } from './form-action'
// import RetroLoader from './loader'
// import { LitePixelsExplorer } from './tables/pixels-lite'

// export function PixelGenerator() {
//   const { pixels, isLoading, mutate, pages, setPages } = usePixelsInfinite()

//   const [state, dispatch, isPending] = useActionState<FormState, FormData>(
//     generateIcon,
//     {
//       error: undefined,
//       result: undefined,
//       id: undefined,
//       success: undefined,
//     }
//   )

//   const isEmpty = pixels?.[0]?.length === 0
//   const isReachingEnd =
//     isEmpty || (pixels && pixels[pixels.length - 1]?.length < JOBS_PAGE_SIZE)

//   const mutatePixels = useCallback(() => {
//     mutate()
//   }, [mutate])

//   return (
//     <main
//       className={cn(
//         'p-2 max-w-[1000px] mx-auto mb-14 mt-8 px-10',
//         'grid grid-cols-1 md:grid-cols-2 md:gap-16'
//       )}
//     >
//       <div
//         id='left'
//         className='flex flex-col items-center justify-center pointer-events-auto'
//       >
//         {/* Input */}
//         <div className='flex flex-col border-2 border-foreground p-2 min-w-[300px] w-full max-w-[500px] relative mt-24'>
//           <div className='absolute -top-[105px] left-1/2 -translate-x-1/2'>
//             <div className='relative mt-20'>
//               <Cooper
//                 className='absolute -top-[75px] left-0 -z-10'
//                 width={120}
//                 height={120}
//               />
//               <Louie
//                 className='absolute -top-[85px] left-[72px] -z-20'
//                 width={120}
//                 height={140}
//               />
//               <SimpleContainer
//                 classNameOuter='w-[200px]'
//                 classNameInner='z-10 px-3 text-center'
//                 addBorder
//               >
//                 <p>create a pixel icon</p>
//               </SimpleContainer>
//             </div>
//           </div>
//           <form className='flex flex-col gap-2 mt-8'>
//             <div className='flex gap-1'>
//               <label className='flex flex-col gap-1' htmlFor='prompt'>
//                 <p className='text-xs bg-foreground text-background px-2 py-1 w-fit'>
//                   prompt
//                 </p>
//               </label>
//               <span className='text-xs px-2 py-1 bg-medium w-fit'>
//                 Tip: It helps to specify colors
//               </span>
//             </div>
//             <textarea
//               className='w-full bg-foreground text-background px-3 py-2 focus:outline-none resize-y min-h-10 h-32 max-h-80 placeholder:text-background/75'
//               id='prompt'
//               name='prompt'
//               placeholder='a lop-ear rabbit sonny angel'
//               required
//             />
//             <input type='hidden' name='id' value={uuidv4()} />
//             <div className='flex w-full gap-2'>
//               <Button type='reset'>clear</Button>
//               <Button
//                 className='flex-1'
//                 disabled={isPending}
//                 formAction={dispatch}
//               >
//                 start
//               </Button>
//             </div>
//           </form>
//         </div>

//         {/* My Icons */}
//         <div className='hidden md:flex flex-col border-2 border-foreground p-2 min-w-[300px] w-full max-w-[500px] relative mt-16 gap-2 min-h-[326px]'>
//           {/* <Star
//             className='absolute -top-[70px] left-0'
//             width={120}
//             height={120}
//           />
//           <Star
//             className='absolute -top-[70px] right-0'
//             width={120}
//             height={120}
//           /> */}
//           <div className='absolute -top-[105px] left-1/2 -translate-x-1/2'>
//             <div className='relative mt-20'>
//               <SimpleContainer
//                 classNameOuter=''
//                 classNameInner='z-10 px-3 text-center'
//                 addBorder
//               >
//                 <p>latest work</p>
//               </SimpleContainer>
//             </div>
//           </div>
//           <div className='mt-8'>
//             <LitePixelsExplorer
//               rows={
//                 pixels?.flatMap((page) => {
//                   return page.map((pixel) => ({
//                     id: pixel.id,
//                     prompt: pixel.prompt,
//                     status: pixel.status,
//                   }))
//                 }) ?? []
//               }
//               isEmpty={isEmpty}
//               isLoading={isLoading}
//             />
//           </div>
//           <div className='flex gap-2'>
//             <ButtonLink className='flex-1 text-center' href='/atelier'>
//               view all
//             </ButtonLink>
//             <Button
//               className='flex-1'
//               disabled={isLoading || isReachingEnd}
//               onClick={() => setPages(pages + 1)}
//             >
//               {isLoading ? 'loading' : 'load more'}
//             </Button>
//           </div>
//         </div>
//       </div>

//       <div id='right' className='flex flex-col items-center '>
//         <div className='flex flex-col border-2 border-foreground p-2 min-w-[300px] w-full max-w-[500px] relative mt-16 md:mt-24 gap-2 h-full'>
//           <div className='absolute -top-[105px] left-1/2 -translate-x-1/2'>
//             <div className='relative mt-20'>
//               <SimpleContainer
//                 classNameOuter=''
//                 classNameInner='z-10 px-3 text-center'
//                 addBorder
//               >
//                 <p>canvas</p>
//               </SimpleContainer>
//             </div>
//           </div>
//           <Output
//             result={state.result}
//             id={state.id}
//             error={state.error}
//             pending={isPending}
//             onStatusChange={mutatePixels}
//           />
//         </div>
//       </div>
//     </main>
//   )
// }

// function Output({
//   result,
//   id,
//   error,
//   pending,
//   onStatusChange,
// }: {
//   result?: PixelApiResponse
//   id?: string
//   error?: ErrorCode
//   pending: boolean
//   onStatusChange: () => void
// }) {
//   const {
//     status,
//     urls,
//     prompt,
//     error: pixelError,
//   } = usePixelStatus({
//     pixelId: id,
//     onStatusChange,
//   })

//   const isPending = useMemo(() => {
//     return pending || status === Status.INITIATED
//   }, [status, pending])

//   const isError = useMemo(() => {
//     return error !== undefined || status === Status.FAILED || pixelError
//   }, [error, status, pixelError])

//   if (isPending) return <Pending />
//   if (isError) return <ErrorState actionError={error} />
//   if (result)
//     return (
//       <PixelImage
//         base64={result?.images[0].base64}
//         urls={urls}
//         prompt={prompt}
//         status={status}
//         duration={result?.inference_time}
//       />
//     )
//   return <EmptyState />
// }

// const STATUS_MAP = {
//   [Status.INITIATED]: 'quest accepted',
//   [Status.POST_PROCESSING]: 'leveling up',
//   [Status.COMPLETED]: 'quest completed',
//   [Status.FAILED]: 'game over - try again',
// }

// function PixelImage({
//   base64,
//   urls,
//   prompt,
//   status,
//   duration,
// }: {
//   base64: string
//   urls?: { svg?: string; png?: string; noBg?: string }
//   prompt?: string | null
//   status?: Status
//   duration?: number
// }) {
//   const onDownload = useCallback(
//     async (href?: string) => {
//       try {
//         if (!href) {
//           toast.error('Image not found, may not be ready yet')
//           return
//         }

//         const response = await fetch(href)

//         if (!response.ok) {
//           throw new Error('Failed to fetch image')
//         }

//         const blob = await response.blob()
//         const blobWithType = new Blob([blob], { type: 'image/svg+xml' })
//         const url = window.URL.createObjectURL(blobWithType)

//         const link = document.createElement('a')
//         link.href = url
//         link.download = 'my-pixel-icon.svg'

//         link.style.display = 'none'
//         document.body.appendChild(link)
//         link.click()

//         setTimeout(() => {
//           document.body.removeChild(link)
//           window.URL.revokeObjectURL(url)
//         }, 100)
//       } catch {
//         toast.error('Failed to download image. Please try again.')
//       }
//     },
//     []
//   )

//   return (
//     <div className='flex flex-col items-center flex-1 mt-[22px] h-full gap-2'>
//       <div className='w-full aspect-square relative border-[2px] border-shadow border-r-highlight border-b-highlight'>
//         <Image
//           className='object-contain'
//           src={`data:image/png;base64,${base64}`}
//           alt='pixelated icon'
//           fill
//           quality={100}
//         />
//       </div>

//       <div className='flex flex-col gap-2 size-full'>
//         <div className='flex flex-col flex-none md:flex-1 text-xs w-full bg-white px-3 py-2 gap-2'>
//           <div className='flex flex-col'>
//             <p className='font-bold text-lg inline-flex gap-1'>
//               <span className='overflow-hidden text-ellipsis'>
//                 {prompt || 'untitled'}
//               </span>
//               <span>({new Date().getFullYear()})</span>
//             </p>
//             <p>pixels on digital matrix</p>
//           </div>
//           <div className='flex flex-col gap'>
//             <p>status: {STATUS_MAP[status ?? Status.POST_PROCESSING]} </p>
//             <p>
//               pixel generation completed in
//               {duration ? ` ${duration} seconds` : ' [pending]'}
//             </p>
//             <p>for optimal experience, squint slightly</p>
//           </div>
//           <p className='text-[0.6rem] mt-auto'>
//             (c) {new Date().getFullYear()} player one x GPU
//           </p>
//         </div>
//         <div className='flex flex-col md:flex-row items-center gap-1 text-sm w-full'>
//           <p className='bg-medium px-2 py-1 flex-1 text-xs w-full'>
//             add to
//             <br />
//             inventory:
//           </p>
//           <Button
//             aria-label='download as png (on white background)'
//             className='w-full flex items-center h-full gap-1 justify-center'
//             type='button'
//             disabled={Boolean(!urls?.png)}
//             onClick={() => onDownload(urls?.png)}
//           >
//             <Download
//               className={cn('size-4', {
//                 'opacity-10': Boolean(!urls?.png),
//               })}
//             />
//             PNG
//           </Button>
//           <Button
//             aria-label='download as png (on transparent background)'
//             className='w-full justify-center flex items-center h-full gap-1'
//             type='button'
//             disabled={Boolean(status !== Status.COMPLETED)}
//             onClick={() => onDownload(urls?.noBg)}
//           >
//             <Download
//               className={cn('size-4', {
//                 'opacity-10': !Boolean(urls?.noBg),
//               })}
//             />
//             PNG
//           </Button>
//           <Button
//             aria-label='download as svg'
//             className='w-full justify-center flex items-center h-full gap-1'
//             type='button'
//             disabled={Boolean(status !== Status.COMPLETED)}
//             onClick={() => onDownload(urls?.svg)}
//           >
//             <Download
//               className={cn('size-4', {
//                 'opacity-10': !Boolean(urls?.svg),
//               })}
//             />
//             SVG
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

// function Pending() {
//   return (
//     <div className='flex flex-col items-center flex-1 justify-center h-full'>
//       <RetroLoader
//         className='p-8 text-foreground flex flex-col items-center justify-center gap-4'
//         title='RUNNING DOTELIER.EXE...'
//       />
//     </div>
//   )
// }

// function EmptyState() {
//   return (
//     <div className='flex flex-col items-center flex-1 justify-center h-full'>
//       <div className='flex items-center justify-center'>
//         <Easel width={250} height={250} />
//       </div>
//       <p className='text-center text-sm max-w-[250px]'>
//         &quot;It&apos;s so fine and yet so terrible to stand in front of a blank
//         canvas.&quot;
//         <br />
//         —Paul Cezanne
//       </p>
//     </div>
//   )
// }

// function ErrorState({ actionError }: { actionError?: ErrorCode }) {
//   const errMsg = actionError ? getError(actionError) : null
//   return (
//     <div className='flex flex-col items-center justify-center h-full'>
//       <div className='text-foreground'>
//         <SadBunny width={150} height={150} />
//       </div>
//       <div className='flex items-center flex-col gap-2'>
//         <p className='text-xl font-bold'>something went wrong</p>
//         <p className='text-sm bg-medium px-2 py-1 w-fit'>
//           {errMsg || 'Unexpected error'}
//         </p>
//         <p className='text-sm bg-medium px-2 py-1 w-fit'>
//           note: credits will not be deducted
//         </p>
//       </div>
//     </div>
//   )
// }
