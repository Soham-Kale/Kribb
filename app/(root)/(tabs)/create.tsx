import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Create() {
    return (
        <SafeAreaView className='flex-1'>
            <View>
                <Text>Create</Text>
            </View>
        </SafeAreaView>
    )
}