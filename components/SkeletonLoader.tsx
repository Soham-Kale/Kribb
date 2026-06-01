import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

function usePulse() {
    const opacity = useRef(new Animated.Value(0.4)).current;
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);
    return opacity;
}

export function SkeletonPropertyCard() {
    const opacity = usePulse();
    return (
        <Animated.View
            style={[
                { opacity, flexDirection: 'row', borderRadius: 16, marginBottom: 16, overflow: 'hidden', backgroundColor: 'white' },
                { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
            ]}
        >
            <View className="w-28 h-28 bg-gray-200" />
            <View className="flex-1 p-3 justify-between">
                <View>
                    <View className="h-3.5 bg-gray-200 rounded-full w-3/4 mb-2" />
                    <View className="h-2.5 bg-gray-200 rounded-full w-1/2 mb-4" />
                    <View className="flex-row justify-between">
                        <View className="h-3 bg-gray-200 rounded-full w-20" />
                        <View className="h-3 bg-gray-200 rounded-full w-16" />
                    </View>
                </View>
            </View>
        </Animated.View>
    );
}

export function SkeletonFeaturedCard() {
    const opacity = usePulse();
    return (
        <Animated.View
            style={[
                { opacity },
                {
                    width: 288,
                    marginRight: 8,
                    borderRadius: 24,
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 2,
                },
            ]}
        >
            <View style={{ height: 176, backgroundColor: '#E5E7EB' }} />
            <View style={{ padding: 16 }}>
                <View className="h-4 bg-gray-200 rounded-full w-3/4 mb-2" />
                <View className="h-3 bg-gray-200 rounded-full w-1/2 mb-3" />
                <View className="flex-row justify-between">
                    <View className="h-4 bg-gray-200 rounded-full w-24" />
                    <View className="h-3 bg-gray-200 rounded-full w-16" />
                </View>
            </View>
        </Animated.View>
    );
}
