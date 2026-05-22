import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserContext } from '@/context/UserContext'

export function useFavorite(presetId: string) {
  const { user } = useUserContext()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)



  const checkFavorite = async ()=> {

    if(!user) return


    const {data} = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user?.id)
    .eq('preset_id', presetId)
    .single()   

    setIsFavorited(!!data) //if data exists, true, if not, null

  } 

  const toggleFavorite = async ()=> {
    if(!user) return

    setIsLoading(true)

    try {
        if(isFavorited){
            await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('preset_id', presetId)

            setIsFavorited(false)
        }
        else{
            await supabase
                .from('favorites')
                .insert({ user_id: user.id, preset_id: presetId })

                setIsFavorited(true)
        }
    }
    catch(error){
        console.error('toggle fav error: ', error)
    }
    finally {
        setIsLoading(false)
    }

  }

    useEffect(() => {
    checkFavorite()
  }, [presetId, user])

  return { isFavorited, isLoading, toggleFavorite }
}