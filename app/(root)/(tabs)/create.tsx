import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Create() {
    return (
        <SafeAreaView className='flex-1' >
            <View className='flex-1 align-center justify-content' >
                <Text>Create</Text>
            </View>
        </SafeAreaView>
    )
}