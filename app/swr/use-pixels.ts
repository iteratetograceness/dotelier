// import useSWRInfinite from 'swr/infinite'
// import { fetcher } from './shared'

// const getKey = (page: number, previousPageData) => {
//   if (previousPageData && !previousPageData.length) return null
//   return `/api/pixels?p=${page}`
// }

// export function usePixelsInfinite() {
//   const { data, error, isLoading, mutate, size, setSize } = useSWRInfinite(
//     getKey,
//     fetcher,
//     { parallel: true }
//   )

//   return {
//     pixels: data,
//     isLoading,
//     isError: error,
//     mutate,
//     pages: size,
//     setPages: setSize,
//   }
// }
