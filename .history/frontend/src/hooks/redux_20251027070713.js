import { useDispatch, useSelector, useStore } from 'react-redux'
import  { RootState, AppDispatch } from '@/store'
// import type { RootState, AppDispatch } from '@/store'

export const useAppDispatch = useDispatch()
export const useAppSelector = useSelector()
export const useAppStore = useStore.withTypes<typeof store>()
// export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
// export const useAppSelector = useSelector.withTypes<RootState>()
// export const useAppStore = useStore.withTypes<typeof store>()