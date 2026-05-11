import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css"

export default function RootLayout() {

  const properties = [
    { id: 1, name: "Modern Apartment", location: "New York", price: "$2000/month" },
    { id: 2, name: "Cozy Cottage", location: "San Francisco", price: "$1500/month" },
    { id: 3, name: "Luxury Villa", location: "Miami", price: "$5000/month" },
  ]

  return <SafeAreaView>
        <View className="p-20 flex-1">
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
            onPress={() => alert("Search Pressed")}
            style={{
              backgroundColor: "#2563EB",
              padding: 12,
              borderRadius: 10,
              marginTop: 10,
              alignItems: "center",
              
            }}
          >
            <Text className=""
            style={{ color: "white", fontWeight: "bold"}}>Search</Text>
          </TouchableOpacity>

          <FlatList
            data = {properties}
            keyExtractor={(item) => `${item.id}`}
            contentContainerStyle = {{ padding: 16 }}
            renderItem = {({ item}) => (
              <View style={{
                backgroundColor: "#f9f9f9",
                padding: 12,
                borderRadius: 10,
                marginBottom: 10,
              }}>
                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                <Text style={{ color: "#666" }}>{item.location}</Text>
                <Text style={{ color: "#2563EB" }}>{item.price}</Text>
              </View>
            )}
          />
          
        </View>
    </SafeAreaView>
}
