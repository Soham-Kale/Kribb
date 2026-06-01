import { useSupabase } from '@/hooks/useSupabase';
import { Property } from '@/types';
import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, KeyboardAvoidingView,
    Platform, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TYPES = ['apartment', 'house', 'villa', 'studio'] as const;
type PropertyType = (typeof TYPES)[number];

const inputClass = 'bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800';
const labelClass = 'text-sm font-semibold text-gray-700 mb-1.5';

export default function EditPropertyScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const authSupabase = useSupabase();
    const { userId, isLoaded: authLoaded } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [type, setType] = useState<PropertyType>('apartment');
    const [bedrooms, setBedrooms] = useState(1);
    const [bathrooms, setBathrooms] = useState(1);
    const [areaSqft, setAreaSqft] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [isFeatured, setIsFeatured] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [localImages, setLocalImages] = useState<string[]>([]);

    useEffect(() => {
        if (!authLoaded || !userId) return;
        const load = async () => {
            const { data, error } = await authSupabase
                .from('properties').select('*').eq('id', id).single();
            if (error || !data) {
                Alert.alert('Error', 'Could not load property.');
                router.back();
                return;
            }
            if (data.owner_clerk_id !== userId) {
                Alert.alert('Unauthorised', 'You can only edit your own listings.');
                router.back();
                return;
            }
            const p = data as Property;
            setTitle(p.title);
            setDescription(p.description ?? '');
            setPrice(String(p.price));
            setType(p.type as PropertyType);
            setBedrooms(p.bedrooms);
            setBathrooms(p.bathrooms);
            setAreaSqft(p.area_sqft ? String(p.area_sqft) : '');
            setAddress(p.address);
            setCity(p.city);
            setLatitude(p.latitude ? String(p.latitude) : '');
            setLongitude(p.longitude ? String(p.longitude) : '');
            setIsFeatured(p.is_featured);
            setImages(p.images ?? []);
            setLocalImages(p.images ?? []);
            setLoading(false);
        };
        load();
    }, [id, userId, authLoaded]);

    const handlePickImages = async () => {
        const remaining = 6 - images.length;
        if (remaining <= 0) {
            Alert.alert('Limit reached', 'You can add up to 6 photos per listing.');
            return;
        }
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Please allow photo library access.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images', allowsMultipleSelection: true,
            quality: 0.7, base64: true, selectionLimit: remaining,
        });
        if (result.canceled) return;
        setUploadingImages(true);
        const uploadedUrls: string[] = [];
        const previewUris: string[] = [];
        for (const asset of result.assets) {
            try {
                const filename = `property_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
                const buffer = Uint8Array.from(atob(asset.base64!), c => c.charCodeAt(0));
                const { error } = await authSupabase.storage
                    .from('property-images').upload(filename, buffer, { contentType: 'image/jpeg' });
                if (error) throw error;
                const { data: urlData } = authSupabase.storage.from('property-images').getPublicUrl(filename);
                uploadedUrls.push(urlData.publicUrl);
                previewUris.push(asset.uri);
            } catch { Alert.alert('Upload Failed', 'One or more images failed.'); }
        }
        setImages(prev => [...prev, ...uploadedUrls].slice(0, 6));
        setLocalImages(prev => [...prev, ...previewUris].slice(0, 6));
        setUploadingImages(false);
    };

    const handleDetectLocation = async () => {
        setDetectingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') { Alert.alert('Permission Denied', 'Location access required.'); return; }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setLatitude(String(loc.coords.latitude));
            setLongitude(String(loc.coords.longitude));
        } catch { Alert.alert('Error', 'Could not detect location.'); }
        finally { setDetectingLocation(false); }
    };

    const handleSave = async () => {
        if (!title.trim()) return Alert.alert('Validation', 'Title is required.');
        if (!price.trim()) return Alert.alert('Validation', 'Price is required.');
        const priceNum = Number(price);
        if (isNaN(priceNum) || priceNum < 1) return Alert.alert('Validation', 'Enter a valid price.');
        if (!address.trim()) return Alert.alert('Validation', 'Address is required.');
        if (!city.trim()) return Alert.alert('Validation', 'City is required.');
        if (images.length === 0) return Alert.alert('Validation', 'At least one image required.');

        setSubmitting(true);
        const { error } = await authSupabase.from('properties').update({
            title: title.trim(), description: description.trim(),
            price: priceNum, type, bedrooms, bathrooms,
            area_sqft: areaSqft ? Number(areaSqft) : null,
            address: address.trim(), city: city.trim(),
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            images, is_featured: isFeatured,
        }).eq('id', id).eq('owner_clerk_id', userId!);
        setSubmitting(false);

        if (error) { Alert.alert('Error', 'Failed to save changes.'); return; }
        Alert.alert('Updated!', 'Your listing has been updated.', [
            { text: 'OK', onPress: () => router.replace('/(root)/my-listings') },
        ]);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-gray-50">
            <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Edit Listing</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Images */}
                    <Text className={labelClass}>Photos</Text>
                    <View className="flex-row flex-wrap gap-3 mb-5">
                        {localImages.map((uri, i) => (
                            <View key={i} className="relative">
                                <Image source={{ uri }} className="w-24 h-24 rounded-2xl" resizeMode="cover" />
                                {i === 0 && (
                                    <View className="absolute top-1 left-1 bg-blue-600 px-1.5 py-0.5 rounded-full">
                                        <Text className="text-white text-[9px] font-bold">COVER</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => { setImages(prev => prev.filter((_, j) => j !== i)); setLocalImages(prev => prev.filter((_, j) => j !== i)); }}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={11} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {localImages.length < 6 && (
                            <TouchableOpacity onPress={handlePickImages} disabled={uploadingImages}
                                className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-300 items-center justify-center">
                                {uploadingImages ? <ActivityIndicator size="small" color="#2563EB" /> : (
                                    <><Ionicons name="camera-outline" size={22} color="#9CA3AF" /><Text className="text-gray-400 text-xs mt-1">Add</Text></>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Title */}
                    <Text className={labelClass}>Title</Text>
                    <TextInput className={`${inputClass} mb-5`} value={title} onChangeText={setTitle} placeholder="Property title" placeholderTextColor="#9CA3AF" />

                    {/* Description */}
                    <Text className={labelClass}>Description</Text>
                    <TextInput className={`${inputClass} h-24 mb-5`} value={description} onChangeText={setDescription} placeholder="Describe the property..." placeholderTextColor="#9CA3AF" multiline textAlignVertical="top" />

                    {/* Price */}
                    <Text className={labelClass}>Price (₹)</Text>
                    <TextInput className={`${inputClass} mb-5`} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 5000000" placeholderTextColor="#9CA3AF" />

                    {/* Type */}
                    <Text className={labelClass}>Property Type</Text>
                    <View className="flex-row flex-wrap gap-2 mb-5">
                        {TYPES.map(t => (
                            <TouchableOpacity key={t} onPress={() => setType(t)}
                                className={`px-4 py-2 rounded-full border ${type === t ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}>
                                <Text className={`text-sm font-semibold capitalize ${type === t ? 'text-white' : 'text-gray-600'}`}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Bedrooms / Bathrooms */}
                    <View className="flex-row gap-4 mb-5">
                        {[{ label: 'Bedrooms', value: bedrooms, set: setBedrooms }, { label: 'Bathrooms', value: bathrooms, set: setBathrooms }].map(({ label, value, set }) => (
                            <View key={label} className="flex-1">
                                <Text className={labelClass}>{label}</Text>
                                <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                    <TouchableOpacity onPress={() => set(Math.max(1, value - 1))} className="w-11 h-11 items-center justify-center">
                                        <Ionicons name="remove" size={18} color="#374151" />
                                    </TouchableOpacity>
                                    <Text className="flex-1 text-center text-gray-800 font-bold text-base">{value}</Text>
                                    <TouchableOpacity onPress={() => set(value + 1)} className="w-11 h-11 items-center justify-center">
                                        <Ionicons name="add" size={18} color="#374151" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Area */}
                    <Text className={labelClass}>Area (sq ft)</Text>
                    <TextInput className={`${inputClass} mb-5`} value={areaSqft} onChangeText={setAreaSqft} keyboardType="numeric" placeholder="e.g. 1200" placeholderTextColor="#9CA3AF" />

                    {/* Address */}
                    <Text className={labelClass}>Address</Text>
                    <TextInput className={`${inputClass} mb-5`} value={address} onChangeText={setAddress} placeholder="Street address" placeholderTextColor="#9CA3AF" />

                    {/* City */}
                    <Text className={labelClass}>City</Text>
                    <TextInput className={`${inputClass} mb-5`} value={city} onChangeText={setCity} placeholder="e.g. Mumbai" placeholderTextColor="#9CA3AF" />

                    {/* Coordinates */}
                    <View className="flex-row items-center justify-between mb-1.5">
                        <Text className={labelClass}>Coordinates</Text>
                        <TouchableOpacity onPress={handleDetectLocation} disabled={detectingLocation}
                            className="flex-row items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
                            {detectingLocation ? <ActivityIndicator size="small" color="#2563EB" /> : <Ionicons name="locate-outline" size={13} color="#2563EB" />}
                            <Text className="text-blue-600 text-xs font-semibold">{detectingLocation ? 'Detecting...' : 'Detect'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-3 mb-5">
                        <TextInput className={`${inputClass} flex-1`} value={latitude} onChangeText={setLatitude} placeholder="Latitude" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
                        <TextInput className={`${inputClass} flex-1`} value={longitude} onChangeText={setLongitude} placeholder="Longitude" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
                    </View>

                    {/* Featured toggle */}
                    <TouchableOpacity onPress={() => setIsFeatured(v => !v)}
                        className={`flex-row items-center justify-between p-4 rounded-2xl border mb-6 ${isFeatured ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                        <View>
                            <Text className={`font-semibold ${isFeatured ? 'text-blue-700' : 'text-gray-700'}`}>Featured Property</Text>
                            <Text className="text-xs text-gray-400 mt-0.5">Show in Featured section on home</Text>
                        </View>
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isFeatured ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                            {isFeatured && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                    </TouchableOpacity>

                    {/* Save */}
                    <TouchableOpacity onPress={handleSave} disabled={submitting || uploadingImages}
                        className="bg-blue-600 rounded-2xl py-4 items-center"
                        style={{ shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Save Changes</Text>}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
