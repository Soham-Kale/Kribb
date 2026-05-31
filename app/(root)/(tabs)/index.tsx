import FeaturedCard from '@/components/FeaturedCard';
import PropertyCard from '@/components/PropertyCard';
import { SkeletonFeaturedCard, SkeletonPropertyCard } from '@/components/SkeletonLoader';
import { supabase } from '@/lib/supabase';
import { Property } from '@/types';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, Image, RefreshControl, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const HomeScreen = () => {
    const { user } = useUser();
    const router = useRouter();

    const [featured, setFeatured] = useState<Property[]>([]);
    const [recommended, setRecommended] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchProperties = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [featuredRes, recommendedRes] = await Promise.all([
            supabase
                .from("properties")
                .select("*")
                .eq("is_featured", true)
                .order("created_at", { ascending: false })
                .limit(10),
            supabase
                .from("properties")
                .select("*")
                .eq("is_featured", false)
                .order("created_at", { ascending: false })
                .limit(20),
        ]);

        if (featuredRes.error || recommendedRes.error) {
            Alert.alert("Error", "Failed to load properties. Please try again.");
        } else {
            setFeatured(featuredRes.data ?? []);
            setRecommended(recommendedRes.data ?? []);
        }

        if (isRefresh) setRefreshing(false);
        else setLoading(false);
    };

    const onRefresh = () => fetchProperties(true);

    const greetingMessage = () => {
        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good Morning";
        } else if (hour < 17) {
            return "Good Afternoon";
        } else if (hour < 21) {
            return "Good Evening";
        } else {
            return "Good Night";
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProperties();
        }, [])
    )

    return (
        <SafeAreaView className='flex-1 bg-gray-50'>
            <FlatList
                data={recommended}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} tintColor="#2563EB" />}
                ListHeaderComponent={
                    <View>
                        {/* Header */}
                        <View className='flex-row items-center justify-between px-5 pt-4 pb-5'>
                            <Image
                                source={require("../../../assets/images/kribb.png")}
                                style={{ width: 90, height: 36 }}
                                resizeMode="contain"
                            />

                            <View className='items-end'>
                                <Text>{greetingMessage()}</Text>
                                <Text className='text-gray-900 text-base font-bold'>{user?.firstName ?? "User"}</Text>
                            </View>
                        </View>

                        {/* Search Bar */}
                        <TouchableOpacity
                            onPress={() => router.push("/(root)/(tabs)/search")}
                            className='mx-5 mb-6 items-center flex-row bg-white rounded-2xl px-4 py-3 gap-3'
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.06,
                                shadowRadius: 6,
                                elevation: 2,
                            }}
                        >
                            <Ionicons name='search-outline' size={18} color="#9CA3AF"/>
                            <Text className='text-gray-400 text-sm flex-1'>
                                Search Properties, cities...
                            </Text>

                            <TouchableOpacity
                                onPress={() => router.push("/(root)/(tabs)/search?openFilters=true")}
                                className='w-8 h-8 rounded-xl bg-blue-600 items-center justify-center'
                            >
                                <Ionicons name='options-outline' size={15} color="white"/>
                            </TouchableOpacity>
                        </TouchableOpacity>

                        {/* Featured Section */}
                        <View className='mb-6'>
                            <Text className='text-gray-900 text-lg font-bold px-5 mb-4'>
                                Featured
                            </Text>

                            {loading ? (
                                <View className="flex-row px-5 gap-3">
                                    {[1, 2, 3].map((i) => <SkeletonFeaturedCard key={i} />)}
                                </View>
                            ) : (
                                <FlatList
                                    data={featured}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({item}) => <FeaturedCard property={item}/>}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 20 }}
                                />
                            )}
                        </View>

                        <Text className='text-gray-900 px-5 mb-4 text-lg font-bold'>
                            Recommended
                        </Text>
                    </View>
                }
                renderItem={({item}) => (
                    <View className='px-5'>
                        <PropertyCard property={item}/>
                    </View>
                )}
                ListEmptyComponent={
                    loading ? (
                        <View className='px-5'>
                            {[1,2,3,4,5].map((i) => <SkeletonPropertyCard key={i} />)}
                        </View>
                    ) : (
                        <View className='items-center py-10'>
                            <Text className='text-gray-400'>No properties found</Text>
                        </View>
                    )
                }
            />            
        </SafeAreaView>
    )
}

export default HomeScreen;