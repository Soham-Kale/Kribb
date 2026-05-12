import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAuth, useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';

export default function SignUp() {

    const { signUp, errors, fetchStatus } = useSignUp();
    const { isSignedIn } = useAuth();

    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");

    const isLoading = fetchStatus === 'fetching';

    return (
        <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            className="bg-white"
            keyboardShouldPersistTaps="handled"
        >
            <View className='flex-1 justify-center px-6 py-12'>
                <Image
                    source={require("../../assets/images/kribb.png")}
                    className='w-32 h-16 mb-8'
                    resizeMode='contain'
                />

                <Text className='text-3xl font-bold text-gray-800 mb-2'>Create Account</Text>
                <Text className='text-gray-500 mb-2'>Find your dream home today</Text>

                <View className='flex-row gap-3 mb-4'>
                    <TextInput 
                        className='flex-1 border border-gray-300 px-4 py-3 rounded-xl'
                        placeholder='First name'
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize='words'
                    />

                    <TextInput 
                        className='flex-1 border border-gray-300 px-4 py-3 rounded-xl'
                        placeholder='Last name'
                        value={lastName}
                        onChangeText={setLastName}
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize='words'
                    />
                </View>

                <TextInput 
                    className='w-full border border-gray-300 px-4 py-3 rounded-xl mb-4'
                    placeholder='Email address'
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#9CA3AF"
                    keyboardType='email-address'
                    autoCapitalize='none'
                />
                {errors.fields.emailAddress && (
                    <Text className='text-red-500 mb-4'>
                        {errors.fields.emailAddress.message}
                    </Text>
                )}

                <TextInput 
                    className='w-full border border-gray-300 px-4 py-3 rounded-xl mb-6'
                    placeholder='Password'
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                />
                {errors.fields.password && (
                    <Text className='text-red-500 mb-4'>
                        {errors.fields.password.message}
                    </Text>
                )}

                <TouchableOpacity
                    disabled={isLoading}
                    className='w-full py-4 bg-blue-600 rounded-xl items-center mb-4'
                >
                    {isLoading ? (
                        <ActivityIndicator color="white"/>
                    ): (
                        <Text className='text-white font-bold text-base'> Sign Up</Text>
                    )}
                </TouchableOpacity>

                <View className='flex-row justify-center'>
                    <Text className='text-gray-500'>Already have an account? </Text>
                        <Link href="/(auth)/sign-in">
                            <Text className='text-blue-500 font-semibold'>Sign In</Text>
                        </Link>
                </View>

            </View>
        </ScrollView>
    )
}