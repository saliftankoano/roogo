import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const Property = () =>{
    const { Id } = useLocalSearchParams();
    return (
        <View>
            <Text>Property {Id}</Text>
        </View>
    )
}

export default Property;