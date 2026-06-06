import { View, Text, ScrollView, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useClerk } from '@clerk/expo'
import { useLocalSearchParams, useRouter } from 'expo-router'

export default function ForgotPassword() {
    const clerk = useClerk()
    const router = useRouter()
    const params = useLocalSearchParams<{ email?: string }>()

    const [step, setStep] = useState<'request' | 'reset'>('request')
    const [email, setEmail] = useState(params.email ?? '')
    const [code, setCode] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const onSendCode = async () => {
        setError('')
        if (!email.trim()) {
            setError('Please enter your email address.')
            return
        }
        setIsLoading(true)
        try {
            await clerk.client?.signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email.trim(),
            })
            setStep('reset')
        } catch (err: any) {
            console.log('Send reset code error:', JSON.stringify(err, null, 2))
            const msg = err.errors?.[0]?.longMessage
                ?? err.errors?.[0]?.message
                ?? err.message
                ?? 'Failed to send reset code. Please try again.'
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    const onResetPassword = async () => {
        setError('')
        if (!code.trim()) {
            setError('Please enter the verification code.')
            return
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.')
            return
        }
        setIsLoading(true)
        try {
            const result = await clerk.client?.signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code: code.trim(),
                password: newPassword,
            })
            if (result?.status === 'complete') {
                await clerk.setActive({ session: result.createdSessionId })
                router.replace('/')
            }
        } catch (err: any) {
            console.log('Reset password error:', JSON.stringify(err, null, 2))
            const msg = err.errors?.[0]?.longMessage
                ?? err.errors?.[0]?.message
                ?? err.message
                ?? 'Reset failed. Please check the code and try again.'
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    const onResendCode = async () => {
        setError('')
        setIsLoading(true)
        try {
            await clerk.client?.signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email.trim(),
            })
        } catch (err: any) {
            const msg = err.errors?.[0]?.longMessage
                ?? err.errors?.[0]?.message
                ?? err.message
                ?? 'Failed to resend code.'
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            className="bg-white"
            keyboardShouldPersistTaps="handled"
        >
            <View className='flex-1 justify-center px-6 py-12'>
                <Image
                    source={require('../../assets/images/kribb.png')}
                    className='w-32 h-16 mb-8'
                    resizeMode='contain'
                />

                {step === 'request' ? (
                    <>
                        <Text className='text-3xl font-bold text-gray-800 mb-2'>Reset Password</Text>
                        <Text className='text-gray-500 mb-6'>
                            Enter your email and we'll send you a verification code.
                        </Text>

                        <TextInput
                            className='w-full border border-gray-300 px-4 py-3 rounded-xl mb-4'
                            placeholder='Email address'
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor="#9CA3AF"
                            keyboardType='email-address'
                            autoCapitalize='none'
                        />

                        {error ? (
                            <Text className='text-red-500 mb-4'>{error}</Text>
                        ) : null}

                        <TouchableOpacity
                            onPress={onSendCode}
                            disabled={isLoading}
                            className='w-full py-4 bg-blue-600 rounded-xl items-center mb-4'
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className='text-white font-bold text-base'>Send Reset Code</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => router.back()} className='items-center py-2'>
                            <Text className='text-blue-600 font-semibold'>Back to Sign In</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text className='text-3xl font-bold text-gray-800 mb-2'>Set New Password</Text>
                        <Text className='text-gray-500 mb-6'>
                            Enter the code sent to {email}, then choose a new password.
                        </Text>

                        <TextInput
                            className='w-full border border-gray-300 px-4 py-3 rounded-xl mb-4'
                            placeholder='Verification code'
                            value={code}
                            onChangeText={setCode}
                            placeholderTextColor="#9CA3AF"
                            keyboardType='number-pad'
                        />

                        <TextInput
                            className='w-full border border-gray-300 px-4 py-3 rounded-xl mb-4'
                            placeholder='New password'
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                        />

                        <TextInput
                            className='w-full border border-gray-300 px-4 py-3 rounded-xl mb-4'
                            placeholder='Confirm new password'
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                        />

                        {error ? (
                            <Text className='text-red-500 mb-4'>{error}</Text>
                        ) : null}

                        <TouchableOpacity
                            onPress={onResetPassword}
                            disabled={isLoading}
                            className='w-full py-4 bg-blue-600 rounded-xl items-center mb-4'
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className='text-white font-bold text-base'>Reset Password</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onResendCode} disabled={isLoading} className='items-center py-2'>
                            <Text className='text-blue-600'>Resend code</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    )
}
