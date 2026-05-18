import { View, Text, ScrollView, FlatList, TouchableOpacity, Image, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useUserStore } from '@/store/userStore';
import { Property } from '@/types';
import { useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    };

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

    const isSaved = true;

    return (
        <View className='flex-1 bg-white'>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                    <View style={{ opacity: property.is_sold ? 0.5 : 1 }}>
                        <FlatList
                            data={property.images}
                            keyExtractor={(_,i) => i.toString()}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    onPress={() => setImageViewerVisible(true)}
                                >
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
                            onScroll={onScroll}
                            scrollEventThrottle={16}
                        />
                    </View>

                    <View className='absolute bottom-3 right-4 bg-black/50 px-3 py-2 rounded-full '>
                        <Text className='text-white text-xs font-medium'>
                            {activeIndex+1}/{property.images.length}
                        </Text>
                    </View>

                    <SafeAreaView className='absolute top-0 left-0 right-0'>
                        <View className='flex-row items-center justify-between px-4 pt-2'>
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                                style={{ elevation: 3 }}
                                >
                                <Ionicons name="arrow-back" size={20} color="#111827" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                // onPress={toggleSave}
                                // disabled={saveLoading}
                                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                                style={{ elevation: 3 }}
                                >
                                <Ionicons
                                    name={isSaved ? "heart" : "heart-outline"}
                                    size={20}
                                    color={isSaved ? "#EF4444" : "#111827"}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </ScrollView>
            
        </View>
    )
}