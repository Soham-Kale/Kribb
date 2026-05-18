import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useUserStore } from '@/store/userStore';
import { Property } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function PropertyDetails() {

    const { id } = useLocalSearchParams<{ id: string}>();
    const { userId } = useAuth();
    const router = useRouter();
    const isAdmin = useUserStore((store) => store.isAdmin);

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);

    const authSupabase = useSupabase();

    const featchProperty = async() => {
        const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

        setProperty(data);
        setLoading(false);
    }

    useEffect(() => {
        featchProperty();
    }, [id])

    if(!property) {
        return (
            <View className='flex-1 items-center justify-center bg-white'>
                <Text className='text-gray-500'>Property not found</Text>
            </View>
        )
    }

    return (
        <View className='flex-1 bg-white'>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <View style={{ opacity: property.is_sold ? 0.5 : 1 }}>
                        <FlatList
                            data={property.images}
                            keyExtractor={(_,i) => i.toString()}
                            renderItem={({item}) => (
                                <TouchableOpacity>
                                    <Image
                                        source={{ uri: item }}
                                        style={{ width, height: 300 }}
                                        resizeMode='cover'
                                        
                                    />
                                </TouchableOpacity>
                            )}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            // onScroll={onscroll}
                            scrollEventThrottle={16}
                        />
                    </View>
                </View>
            </ScrollView>
            <Text>PropertyDetails</Text>
        </View>
    )
}