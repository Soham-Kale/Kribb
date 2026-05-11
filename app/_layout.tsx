import { Stack } from "expo-router";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return <SafeAreaView>
        <View style={{ padding: 30 }}>
          <Text>First Production Ready App</Text>

          <TextInput 
            placeholder="Search City..."
            placeholderTextColor="#999"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 10,
              marginTop: 12,
            }}
          ></TextInput>

          <TouchableOpacity
            style={{
              backgroundColor: "#2563EB",
              padding: 12,
              borderRadius: 10,
              marginTop: 10,
              alignItems: "center",
              
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold"}}>Search</Text>
          </TouchableOpacity>
          
        </View>
    </SafeAreaView>
}
