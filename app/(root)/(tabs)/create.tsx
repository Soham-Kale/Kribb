import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router';
import { useSupabase } from '@/hooks/useSupabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

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
};

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

    const updateForm = (fields: Partial<FormState>) => {
        setForm((prev) => ({ ...prev, ...fields }));
    }

    // ─── Image Picker ──────────────────────────────────────────
    const handlePickImages = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if(!permission.granted) {
            Alert.alert(
                "Permission Required",
                "Please allow access to your photo library."
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsMultipleSelection: true,
            quality: 0.7,
            base64: true,
            selectionLimit: 6,
        });

        if(result.canceled) return;
        setUploadingImages(false);

        const uploadedUrls: string[] = [];
        const previewUris: string[] = []; 

        for (const asset of result.assets) {
            try {
                const filename = `property_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2)}.jpg`;

                const base64 = asset.base64!;
                const buffer = Uint8Array.from(atob(base64), (c) =>
                    c.charCodeAt(0)
                );

                const { error } = await authSupabase.storage
                    .from("property-images")
                    .upload(filename, buffer, {
                        contentType: "image/jpeg",
                        upsert: false,
                });

                if (error) throw error;
            } catch (error) {}
        }
    };

    const handleRemoveImage = (index: number) => {};

    const handleDetectLocation = async () => {};

    const handleSubmit = async () => {};

    return (
        <SafeAreaView className='flex-1 ' >
            <KeyboardAvoidingView
                behavior={ Platform.OS === 'ios' ? "padding" : "height"}
                className='flex-1'
            >
                <View className='flex-row items-center px-5 pt-4 pb-3'>
                    <Text className='text-2xl font-bold text-gray-900 flex-1'>
                        Add Property
                    </Text>
                </View>

                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className={sectionClass}>
                        <Text className={labelClass}>
                            Photos{" "}
                            <Text className='text-gray-400 font-normal'>(up to 6)</Text>
                        </Text>

                        <View className='flex-row flex-wrap gap-3'>
                            {form.localImages.map((uri, index) => (
                                <View key={index} className='relative'>
                                    <Image
                                        source={{ uri }}
                                        className='w-24 h-24 rounded-2xl'
                                        resizeMode='cover'
                                    />

                                    {index === 0 && (
                                        <View className='absolute top-1 left-1 bg-blue-500 px-1.5 py-0.5 rounded-full'>
                                            <Text className='text-white tex-[9px] font-bold'>
                                                COVER
                                            </Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        onPress={() => handleRemoveImage(index)}
                                        className='absolute -right-2 -top-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center'
                                    >
                                        <Ionicons name='close' size={11} color='white'/>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {form.localImages.length < 6 && (
                                <TouchableOpacity
                                    onPress={handlePickImages}
                                    disabled={uploadingImages}
                                    className='w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-300 
                                            items-center justify-center'
                                >
                                    {uploadingImages ? (
                                        <ActivityIndicator size='small' color="#2563EB"/>
                                    ): (
                                        <>
                                            <Ionicons
                                                name='camera-outline'
                                                size={22}
                                                color="#9CA3AF"
                                            />
                                            <Text className='text-gray-400 mt-1 text-xs'>Add</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
};