import { useAuth } from '@clerk/expo';
import { router } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {

    const { signOut } = useAuth();

    const onPressSignOut = async () => {
        try{
            await signOut();
            router.replace("/sign-in");
        }catch(error) {
            alert("Error signing out: " + error);
        }
    };

    return (
        // <NativeTabs>
        // <NativeTabs.Trigger name="index">
        //     <Label>Home</Label>
        //     <Icon sf="house.fill" />
        // </NativeTabs.Trigger>
        // <NativeTabs.Trigger name="search">
        //     <Icon sf="magnifyingglass" />
        //     <Label>Search</Label>
        // </NativeTabs.Trigger>
        // <NativeTabs.Trigger name="saved">
        //     <Icon sf="bookmark.fill" />
        //     <Label>Saved</Label>
        // </NativeTabs.Trigger>

        // <NativeTabs.Trigger name="profile">
        //     <Icon sf="person.circle" />
        //     <Label>Profile</Label>
        // </NativeTabs.Trigger>
        // </NativeTabs>
        
        <SafeAreaView className="flex-1 items-center justify-center">
            <Text>Home</Text>
            <TouchableOpacity onPress={onPressSignOut}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
