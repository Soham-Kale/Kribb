import { useAuth, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useSupabase } from '@/hooks/useSupabase';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const { signOut } = useAuth();
    const authSupabase = useSupabase();

    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingImage, setIsUpdatingImage] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdateProfileImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photo library to update your profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (result.canceled) return;
            setIsUpdatingImage(true);

            const base64Image = result.assets[0].base64;
            const uri = result.assets[0].uri;
            const filename = uri.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const mimeType = match ? `image/${match[1]}` : 'image/jpeg';
            const dataUrl = `data:${mimeType};base64,${base64Image}`;

            await user?.setProfileImage({ file: dataUrl });
            Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile picture. Please try again.');
        } finally {
            setIsUpdatingImage(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account, all your listings, saved properties, and profile data. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete permanently',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            const uid = user!.id;
                            await authSupabase.from('saved_properties').delete().eq('user_clerk_id', uid);
                            await authSupabase.from('properties').delete().eq('owner_clerk_id', uid);
                            await authSupabase.from('users').delete().eq('clerk_id', uid);
                            await user!.delete();
                            await signOut();
                            router.replace('/(auth)/sign-in');
                        } catch {
                            Alert.alert('Error', 'Failed to delete account. Please try again or contact support.');
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!firstName.trim()) {
            Alert.alert('Validation', 'First name cannot be empty.');
            return;
        }

        setIsSaving(true);
        try {
            await user?.update({ firstName: firstName.trim(), lastName: lastName.trim() });

            await authSupabase
                .from('users')
                .update({ first_name: firstName.trim(), last_name: lastName.trim() })
                .eq('clerk_id', user!.id);

            Alert.alert('Success', 'Your information has been saved.');
        } catch (error) {
            Alert.alert('Error', 'Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isLoaded || !user) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Settings</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {/* Avatar */}
                    <View className="items-center py-8">
                        <View className="relative">
                            <Image
                                source={{ uri: user.imageUrl }}
                                className="w-24 h-24 rounded-full"
                            />
                            <TouchableOpacity
                                className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2"
                                onPress={handleUpdateProfileImage}
                                disabled={isUpdatingImage}
                            >
                                {isUpdatingImage ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Ionicons name="camera" size={18} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <Text className="text-sm text-gray-500 mt-3">Tap camera to change photo</Text>
                    </View>

                    {/* Form */}
                    <View className="px-6 gap-5">
                        <Text className="text-base font-bold text-gray-700">Personal Information</Text>

                        <View className="gap-1.5">
                            <Text className="text-sm font-semibold text-gray-700">First Name</Text>
                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Enter first name"
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-base"
                            />
                        </View>

                        <View className="gap-1.5">
                            <Text className="text-sm font-semibold text-gray-700">Last Name</Text>
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Enter last name"
                                placeholderTextColor="#9CA3AF"
                                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-base"
                            />
                        </View>

                        <View className="gap-1.5">
                            <Text className="text-sm font-semibold text-gray-700">Email</Text>
                            <View className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center gap-2">
                                <Text className="flex-1 text-gray-400 text-base">
                                    {user.emailAddresses[0].emailAddress}
                                </Text>
                                <Ionicons name="lock-closed-outline" size={16} color="#9CA3AF" />
                            </View>
                            <Text className="text-xs text-gray-400 ml-1">Email cannot be changed here.</Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 rounded-2xl py-4 items-center mt-2"
                            style={{
                                shadowColor: '#3B82F6',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">Save Changes</Text>
                            )}
                        </TouchableOpacity>

                        <View className="mt-8 border-t border-gray-100 pt-6">
                            <Text className="text-sm font-semibold text-gray-700 mb-1">Danger Zone</Text>
                            <Text className="text-xs text-gray-400 mb-4">
                                Deleting your account is permanent. All your listings, saved properties, and profile data will be removed immediately.
                            </Text>
                            <TouchableOpacity
                                onPress={handleDeleteAccount}
                                disabled={isDeleting}
                                className="flex-row items-center justify-center gap-2 border border-red-200 bg-red-50 rounded-2xl py-4"
                            >
                                {isDeleting ? (
                                    <ActivityIndicator color="#EF4444" />
                                ) : (
                                    <>
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        <Text className="text-red-500 font-semibold text-base">Delete Account</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
