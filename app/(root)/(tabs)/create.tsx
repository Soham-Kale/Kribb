import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import { useSupabase } from '@/hooks/useSupabase';

const TYPES = ["apartment", "house", "villa", "studio"] as const;
type PropertyType = (typeof TYPES)[number];

const MIN_PRICE = 1;
const MAX_PRICE = 999_999_999;

const inputClass =
    "bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800";
const labelClass = "text-sm font-semibold text-gray-700 mb-1.5";
const sectionClass = "mb-5";

interface FormState {
    title: string;
    description: string;
    price: string;
    type: PropertyType;
    bedrooms: number;
    bathrooms: number;
    areaSqft: string;
    address: string;
    city: string;
    latitude: string;
    longitude: string;
    isFeatured: boolean;
    images: string[];
    localImages: string[];
}

const INITIAL_FORM: FormState = {
    title: "",
    description: "",
    price: "",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    areaSqft: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    isFeatured: false,
    images: [],
    localImages: [],
};


export default function Create() {
    const router = useRouter();
    const authSupabase = useSupabase();

    const [form, setForm] = useState<FormState>(INITIAL_FORM);

    const [submitting, setSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);


    return (
        <SafeAreaView className='flex-1 ' >
            <View className='flex-1 align-center justify-content' >
                <Text className=''>Create</Text>
            </View>
        </SafeAreaView>
    )
}