import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Switch,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationPreferences {
    newProperties: boolean;
    priceDrops: boolean;
    propertyUpdates: boolean;
    appUpdates: boolean;
}

const defaultPreferences: NotificationPreferences = {
    newProperties: true,
    priceDrops: true,
    propertyUpdates: false,
    appUpdates: false,
};

export default function NotificationsScreen() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPreferences);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        const stored = user.unsafeMetadata?.notificationPreferences as NotificationPreferences | undefined;
        if (stored) setPrefs(stored);
    }, [user]);

    const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
        const updated = { ...prefs, [key]: value };
        setPrefs(updated);
        setSaving(true);
        try {
            await user?.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    notificationPreferences: updated,
                },
            });
        } catch {
            // Revert on failure
            setPrefs(prefs);
        } finally {
            setSaving(false);
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
                <Text className="text-xl font-bold text-gray-800">Notifications</Text>
                {saving && (
                    <ActivityIndicator size="small" color="#3B82F6" style={{ marginLeft: 'auto' }} />
                )}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                <Text className="px-6 pt-6 pb-3 text-sm font-semibold text-gray-500 uppercase tracking-widest">
                    Property Alerts
                </Text>

                <NotifRow
                    icon="home-outline"
                    label="New Properties"
                    description="Get notified when new listings are added"
                    value={prefs.newProperties}
                    onToggle={(v) => handleToggle('newProperties', v)}
                />
                <NotifRow
                    icon="pricetag-outline"
                    label="Price Drops"
                    description="Alerts when a saved property drops in price"
                    value={prefs.priceDrops}
                    onToggle={(v) => handleToggle('priceDrops', v)}
                />
                <NotifRow
                    icon="refresh-outline"
                    label="Property Updates"
                    description="Status changes like sold or removed"
                    value={prefs.propertyUpdates}
                    onToggle={(v) => handleToggle('propertyUpdates', v)}
                />

                <Text className="px-6 pt-6 pb-3 text-sm font-semibold text-gray-500 uppercase tracking-widest">
                    General
                </Text>

                <NotifRow
                    icon="megaphone-outline"
                    label="App Updates"
                    description="News, tips, and announcements from Kribb"
                    value={prefs.appUpdates}
                    onToggle={(v) => handleToggle('appUpdates', v)}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

function NotifRow({
    icon,
    label,
    description,
    value,
    onToggle,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description: string;
    value: boolean;
    onToggle: (v: boolean) => void;
}) {
    return (
        <View className="mx-6 mb-3 flex-row items-center bg-gray-50 px-4 py-4 rounded-2xl gap-4">
            <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center">
                <Ionicons name={icon} size={18} color="#3B82F6" />
            </View>
            <View className="flex-1">
                <Text className="text-gray-800 font-semibold text-base">{label}</Text>
                <Text className="text-gray-500 text-sm mt-0.5">{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={value ? '#3B82F6' : '#9CA3AF'}
            />
        </View>
    );
}
