import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import axios from 'axios'
import { setCreatorCourseData } from '../redux/courseSlice'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const getCreatorCourseData = () => {
    const dispatch = useDispatch()
    const {userData} = useSelector(state=>state.user)
  return (
    useEffect(()=>{
    if (!["admin", "manager"].includes(userData?.role)) {
      dispatch(setCreatorCourseData([]))
      return
    }

    const getCreatorData = async () => {
      try {
        const result = await axios.get(serverUrl + "/api/course/getcreatorcourses" , {withCredentials:true})
        
         await dispatch(setCreatorCourseData(result.data))

        
        console.log(result.data)
        
      } catch (error) {
        console.log(error)
        const message = error?.response?.data?.message
        if (message) toast.error(message)
      }
      
    }
    getCreatorData()
  },[userData, dispatch])
  )
}

export default getCreatorCourseData
